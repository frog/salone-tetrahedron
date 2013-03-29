/* This is the Tetralogo version that connects to the node server
   and uses socket events to pass the animation from a browser to
   the other.
   
   Code should be refactored and merged with the single-page Tetralogo.
*/

var camera, scene, renderer, geometry, material, mesh;

var orbGeometry, orbMesh;

var pause = false;


var width = viewport().width;;
var height = viewport().height;
var radius = 200;

var screenStartPosition, screenEndPosition;
var worldStartPosition, worldEndPosition;
var worldVisibleWidth;
	
var triggered = false;

var socket = io.connect('http://localhost:3000');
// var socket = io.connect();

socket.on('start', function(data) {
							console.log('received start event with data', data);
						setupTween();
					});

function init() {
    // create the scene
    scene = new THREE.Scene();

	// add a camera
    // camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / - 2, -2000, 2000);
    camera.position.z = 1000;
    scene.add(camera);

	// add a tetrahedron
    geometry = new THREE.TetrahedronGeometry(radius);
    options = {
        color: 0xfcf395,
        wireframe: true,
        wireframeLinewidth: 8,
        side: THREE.DoubleSide
    };
    material = new THREE.MeshBasicMaterial(options);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = radius;
    scene.add(mesh);
    
    mesh2 = new THREE.Mesh(geometry, material);
    mesh2.position.y = -radius;
    scene.add(mesh2);

	// add a sphere
	orbGeometry = new THREE.SphereGeometry(radius, 10, 10);
	orb = new THREE.Mesh(orbGeometry, material);
	scene.add(orb);

	// set up the renderer and render the scene    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.getElementById('tetralogo').appendChild(renderer.domElement);
   	renderer.render(scene, camera);
}


function setupTween() {
	// remove previous tweens if needed
	TWEEN.removeAll();
	
	// define the internal update function of the tween animation
	var update	= function(){
		mesh.position.x = current.x;
		// mesh.position.y = Math.cos(current.x/100)*100;
		mesh.rotation.x += spinX;
		mesh.rotation.y += spinY;
		
		mesh2.rotation = mesh.rotation
		mesh2.position.x = current.x;
		orb.position =  mesh.position;		
	}
	
	
	screenStartPosition = {x: 1, y: height/2};
	screenEndPosition   = {x: width, y: height/2};
	console.log('screenStartPosition: ', screenStartPosition);
	console.log('screenEndPosition: ', screenEndPosition);
		
	worldStartPosition  = projectToWorld(screenStartPosition);
	worldEndPosition    = projectToWorld(screenEndPosition);
	//console.log('worldStartPosition: ', worldStartPosition);
	//console.log('worldEndPosition: ', worldEndPosition);
	worldVisibleWidth = worldEndPosition.x
	worldStartPosition.x -= radius*1.1;
	worldEndPosition.x += radius*1.1;

	var current = worldStartPosition;
	// var easing = TWEEN.Easing.Elastic.InOut;
	var easing = TWEEN.Easing.Linear.None;
	// var easing = TWEEN.Easing.Cubic.Out;
	var delay = 0;
	var duration = 3000;
	var spinX = 0.02;
	var spinY = 0.05;
	
	// build the tween to go from left to right
	var tweenHead = new TWEEN.Tween(current)
		.to({x: worldEndPosition.x}, duration)
		.easing(easing)
		.delay(delay)
		.onUpdate(update);

	// ...and back
	var tweenBack = new TWEEN.Tween(current)
		.to({x: worldStartPosition.x}, 0)
		.delay(delay)
		.easing(easing)
		.onUpdate(update);

	// after tweenHead do tweenBack
	//tweenHead.chain(tweenBack);
	// after tweenBack do tweenHead, to create an animation loop
	//tweenBack.chain(tweenHead);

	// start the first
	tweenHead.start();
}

function animate() {
    if (pause == false) {
    	requestAnimationFrame(animate);
		TWEEN.update();
		stats.update();
	    render();
	    if (mesh.position.x >= worldVisibleWidth)
	    {
	    	if (triggered == false) {
		    	console.log('TRIGGER NEXT WINDOW', mesh.position.x, mesh.position.y, mesh.rotation.x, mesh.rotation.y);
		    	triggered = true;
		    	socket.emit('startnext', { 'posx':  mesh.position.x, 'posy':  mesh.position.y,
		    						   'rotx':  mesh.rotation.x, 'roty':  mesh.rotation.y });
		    }
	    } else {
	    	if (triggered == true) {
	    		triggered = false;
	    	}
	    }
	}
}

function render() {
   	renderer.render(scene, camera);
}

function viewport()
{
	var e = window;
	var a = 'inner';
	if ( !( 'innerWidth' in window ) )
	{
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

function projectToScreen(worldPosition) {
	var widthHalf = width / 2;
	var heightHalf = height / 2;
	var projector = new THREE.Projector();
	p2D = projector.projectVector(worldPosition.clone(), camera);
 
	//need extra steps to convert p2D to window's coordinates
	p2D.x = (p2D.x + 1) * widthHalf;
	p2D.y = (p2D.y + 1) * heightHalf;
 
	return p2D;
}

function projectToWorld(screenPosition) {
	var elem = renderer.domElement;
	var boundingRect = elem.getBoundingClientRect();
	var x = (screenPosition.x - boundingRect.left) * (elem.width / boundingRect.width);
	var y = (screenPosition.y - boundingRect.top) * (elem.height / boundingRect.height);
		
	var vector = new THREE.Vector3( 
		( screenPosition.x / width ) * 2 - 1, 
		- ( screenPosition.y / height ) * 2 + 1, 
		0.5 
	);
	
	var projector = new THREE.Projector();
	projector.unprojectVector( vector, camera );
	var dir = vector.sub( camera.position ).normalize();
	var ray = new THREE.Ray( camera.position, dir );
	var distance = - camera.position.z / dir.z;
	return camera.position.clone().add( dir.multiplyScalar( distance ) );
}


function resetRenderer() {
	width = viewport().width;
	height = viewport().height;
    // notify the renderer of the size change
	renderer.setSize(width, height);
    // update the camera
    
    // camera.aspect = width / height; // this is for perspective camera
    
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / - 2;
    camera.updateProjectionMatrix();
    setupTween();
}

window.onresize = function(event) {
	resetRenderer();
}

window.onclick = function(event) {
	if (pause == true) {
		pause = false;
		animate();
	} else {
		pause = true;
	}
	console.log(pause);
	
	/*
	console.log('--------------------');
	console.log('click');
	console.log('click screen position: ', event.x, event.y);
	var clickWorldPosition = projectToWorld({ x: event.x, y: event.y})
	console.log(clickWorldPosition);
	console.log('click world position (projectToWorld): ', clickWorldPosition.x, clickWorldPosition.y)
	var clickScreenPosition = projectToScreen(clickWorldPosition);
	console.log('click world position (projectToScreen(projectToWorld)): ', clickScreenPosition.x, clickScreenPosition.y);
	
	console.log('mesh');
	var screenPosition = projectToScreen(mesh.position);
	console.log('mesh screen position: ', screenPosition.x, screenPosition.y);
	
	var worldPosition = projectToWorld(screenPosition);
	console.log('mesh world position (mesh.position): ', mesh.position.x, mesh.position.y);
	console.log('mesh world position (projectToWorld): ', worldPosition.x, worldPosition.y);			
	*/
}


// add keyboard controls
document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        /*
        case 13:
            // ENTER. ESC should also take you out of fullscreen by default.
            e.preventDefault();
            document.cancelFullScreen(); // explicitly go out of fs.
            break;
        case 70:
            // 'f' key
            enterFullscreen();
            init();
            break;
        */
        case 83:
        	// 's' key
        	if (stats.domElement.style.visibility !== 'hidden') {
	    		stats.domElement.style.visibility = 'hidden';
        	}
        	else {
        		stats.domElement.style.visibility = 'visible';
			}
        	break;	
    }
}, false);


// Create stats display
var container = document.createElement('div');
document.body.appendChild(container);
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
container.appendChild( stats.domElement );

init();
animate();