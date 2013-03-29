var camera, scene, renderer, geometry, material, mesh;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;
    scene.add(camera);

    geometry = new THREE.TetrahedronGeometry(120);

    options = {
        color: 0xfcf395,
        wireframe: true,
        wireframeLinewidth: 8,
        side: THREE.DoubleSide
    }
    material = new THREE.MeshBasicMaterial(options);

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);
    stats.update();
    render();
}

function render() {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.005;

    renderer.render(scene, camera);
}


// Create stats display
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
stats.domElement.style.visibility = 'hidden'
document.body.appendChild(stats.domElement);


// add keyboard controls
document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case 13:
            // ENTER. ESC should also take you out of fullscreen by default.
            // e.preventDefault();
            // document.cancelFullScreen(); // explicitly go out of fs.
            break;
        case 70:
            // 'f' key
            // enterFullscreen();
            // init();
            break;
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

// run the app
init();
animate();
