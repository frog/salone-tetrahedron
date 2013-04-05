/**
 * Communication module for the client side.
 * Encapsulates the dependency from the underlying network layer.
 * Currently depending on socket.io
 */
define(['socket.io'], function(socket) {
    console.log("-> Comm: ", socket);

    var that;
    /**
     * Singleton constructor of the
     *
     * @constructor
     */
    var Comm = function() {
        init();
        that = this;
    };

    var socket;

    function init() {
        socket = io.connect();
    }

    /**
     * register callback for update of the background color
     * @param func callback; will receive in data.bgcolor the new background color to apply
     */
    Comm.prototype.registerForUpdate = function(func) {
        socket.on('update', func);
    }


    /**
     * register callback for update of the position on the grid
     * @param func callback; will receive in data.row and data.column the new position
     */
    Comm.prototype.registerForPosition = function(func) {
        socket.on('position', func);
    }

    /**
     * Request to be assigned to new position to server. Assignment is immediate, don't wait for confirmation.
     *
     * @param pars.row current rotation on x axis of the tetrahedron
     * @param pars.column current rotation on y axis of the tetrahedron
     */
    Comm.prototype.sendConfig = function(pars) {
        socket.emit('config', pars);
    }

    /**
     * register callback for start a new tetrahedron on the scree
     * @param func callback when a new tetrahedron should enter
     */
    Comm.prototype.registerForStart = function(func) {
        socket.on('start', func);
    }

    /**
     * Signalling the server that tetrahedron animation is over and should move to next screen.
     *
     * @param pars.rotx current rotation on x axis of the tetrahedron
     * @param pars.roty current rotation on y axis of the tetrahedron
     */
    Comm.prototype.sendStartNext = function(pars) {
        socket.emit('startnext', pars);
    }

    //should always return the same singleton
    return new Comm();
});
