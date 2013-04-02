/* This is the Tetralogo version that connects to the node server
 and uses socket events to pass the animation from a browser to
 the other.

 Code should be refactored and merged with the single-page Tetralogo.
 */
define(['three', 'stats', 'jquery_fullscreen', 'tween', 'socket.io'], function () {
    var camera, scene, renderer, geometry, material, mesh;

    var pause = false;


    var width = viewport().width;
    var height = viewport().height;
    var radius = height / 2;

    var screenStartPosition, screenEndPosition;
    var worldStartPosition, worldEndPosition;
    var worldVisibleWidth;

    var triggered = false;

    var socket = io.connect();

    socket.on('start', function (data) {
        console.log('received start event with data', data);
        if (data) {
            mesh.rotation.x = data.rotx;
            mesh.rotation.y = data.roty;
        }
        setupTween();
    });

    function init() {
        radius = 0.6;
        // create the scene
        scene = new THREE.Scene();
        scene.add(camera);

        // add a tetrahedron
        geometry = new THREE.TetrahedronGeometry(radius);
        material = new THREE.MeshBasicMaterial({
            color: 0xfcf395,
            wireframe: true,
            wireframeLinewidth: 8,
            side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);


        // add a camera
        // camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
        //camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -2000, 2000);

        camera = new THREE.OrthographicCamera();
        renderer = new THREE.WebGLRenderer();

        resetRenderer();
        $('#tetralogo').append(renderer.domElement);
        renderer.render(scene, camera);
    }


    function setupTween() {
        // remove previous tweens if needed
        TWEEN.removeAll();


        screenStartPosition = {x: 1, y: height / 2};
        screenEndPosition = {x: width, y: height / 2};
        console.log('screen, start[', screenStartPosition, "], stop[", screenEndPosition, "]");

        worldStartPosition = projectToWorld(screenStartPosition);
        worldEndPosition = projectToWorld(screenEndPosition);
        console.log('world, start[', worldStartPosition, "], stop[", worldEndPosition, "]");

        worldVisibleWidth = worldEndPosition.x;

        //we want to roll a little bit over the end of window
        worldStartPosition.x -= radius * 2;
        worldEndPosition.x += radius * 2;

        var pos = worldStartPosition;
        var rot = {x: mesh.rotation.x, y: mesh.rotation.y};

        var easing = TWEEN.Easing.Linear.None;
        var delay = 0;
        var duration = 3000;

        // build the tween to go from left to right
        var tweenHead = new TWEEN.Tween(pos)
            .to({x: worldEndPosition.x}, duration)
            .easing(easing)
            .delay(delay).onUpdate(function () {
                mesh.position.x = pos.x;
            });

        var tweenRot = new TWEEN.Tween(rot)
            .to({x: rot.x + 4, y: rot.y + 10}, duration)
            .easing(easing)
            .delay(delay)
            .onUpdate(function () {
                mesh.rotation.x = rot.x;
                mesh.rotation.y = rot.y;
            });

        // start the animations
        tweenHead.start();
        tweenRot.start();
    }

    function animate() {
        if (pause == false) {
            requestAnimationFrame(animate);
            TWEEN.update();
            stats.update();
            render();
            if (mesh.position.x >= worldVisibleWidth) {
                if (triggered == false) {
                    console.log('TRIGGER NEXT WINDOW', mesh.position.x, mesh.position.y, mesh.rotation.x, mesh.rotation.y);
                    triggered = true;
                    socket.emit('startnext', { 'posx': mesh.position.x, 'posy': mesh.position.y,
                        'rotx': mesh.rotation.x, 'roty': mesh.rotation.y });
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

    function viewport() {
        var e = window;
        var a = 'inner';
        if (!( 'innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width: e[ a + 'Width' ], height: e[ a + 'Height' ] }
    }

    function projectToWorld(screenPosition) {
        var elem = renderer.domElement;
        var boundingRect = elem.getBoundingClientRect();
        var x = (screenPosition.x - boundingRect.left) * (elem.width / boundingRect.width);
        var y = (screenPosition.y - boundingRect.top) * (elem.height / boundingRect.height);

        var vector = new THREE.Vector3(
            ( screenPosition.x / width ) * 2 - 1,
            -( screenPosition.y / height ) * 2 + 1,
            0.5
        );

        var projector = new THREE.Projector();
        projector.unprojectVector(vector, camera);
        var dir = vector.sub(camera.position).normalize();
        var ray = new THREE.Ray(camera.position, dir);
        var distance = -camera.position.z / dir.z;
        return camera.position.clone().add(dir.multiplyScalar(distance));
    }


    function resetRenderer() {
        width = viewport().width;
        height = viewport().height;
        console.log("[w: " + width + ", h: " + height + "]");
        var normWidth = 2.0;
        var normHeight = 2.0;
        if (height < width) {
            normHeight = 2.0;
            normWidth = normHeight * (width / height);
        } else if (width < height) {
            normWidth = 2.0;
            normHeight = normWidth * (height / width);
        }
        camera.left = normWidth / -2;
        camera.right = normWidth / 2;
        camera.top = normHeight / 2;
        camera.bottom = normHeight / -2;
        camera.near = -1;
        camera.far = 2;
        camera.position.z = 1;
        camera.updateProjectionMatrix();

        // notify the renderer of the size change
        renderer.setSize(width, height);
    }

    window.onresize = function (event) {
        console.log('onresize');
        resetRenderer();
    }

    window.onclick = function (event) {
        if (pause == true) {
            pause = false;
            animate();
        } else {
            pause = true;
        }
        console.log(pause);
    }


// add keyboard controls
    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {

            case 13: // ENTER. ESC should also take you out of fullscreen by default.
                e.preventDefault();
                $('body').exitFullscreen(); // explicitly go out of fs.
                break;
            case 70: // 'f' key
                $('body').fullscreen();
                init();
                break;
            case 83: // 's' key
                $(stats.domElement).toggle();
                break;
        }
    }, false);


    // Create stats display
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    $('#tetralogo').append(stats.domElement);
    $(stats.domElement).hide();

    init();
    animate();
});