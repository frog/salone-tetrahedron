//dependencies
var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
});
// Mode constants
var MODE_OFF = 0;
var MODE_COLOR_CYCLE_SYNC = 1;
var MODE_COLOR_CYCLE_SNAKE = 2;
var MODE_COLOR_CYCLE_MATRIX = 3;

// Grid dimensions
var GRID_COLUMNS = 4;
var GRID_ROWS = 2;

// Starting mode
var mode = MODE_COLOR_CYCLE_SYNC;

// Allocate empty grid
// grid accessed using: grid[column_no][row_no]
var grid = Array(GRID_COLUMNS);
for (var i = 0; i < GRID_COLUMNS; i++) {
    grid[i] = Array(GRID_ROWS);
}
var socketCounter = 0; // track number of clients

function upsertClient(socket, row, column) {
    // Remove client from grid (if present)
    removeClient(socket);


    // Find insert position
    if (column < 0) {
        // Find first available column
        for (column = 0; column < GRID_COLUMNS; column++) {
            for (row = 0; row < GRID_ROWS; row++) {
                if (typeof(grid[column][row]) == 'undefined') break;
            }
            if (row >= 0) break;
        }
    }

    // Add client to grid
    grid[column][row] = socket;
    socketCounter++;
    console.log("upsert at column ", column, ", row ", row, "; counter = ", socketCounter);

    // Inform client of position
    socket.emit('position', { row: row, column: column });

}

// Look for an empty slot in the grid and return its row and column indexes
function firstAvailableSlot() {
    for (var row = 0; row < GRID_ROWS; row++) {
        for (var column = 0; column < GRID_COLUMNS; column++) {
            if (typeof(grid[column][row]) == 'undefined') {
                return { row: row, column: column };
            }
        }
    }
    return; // undefined
}

// Add a client to first available slot, if any
function addClient(socket) {
    var position = firstAvailableSlot();
    if (typeof(position) !== 'undefined') {
        // available slot found, adding client and returning its position
        grid[position.column][position.row] = socket;
        socketCounter++;
        console.log("--->upsert at row ", position.row, ", col ", position.column, "; counter = ", socketCounter);
    }
    // return position (undefined if no available was found)
    return position;
}

function removeClient(socket) {
    // Check if client is present
    var oldRow = -1;
    var oldColumn;
    for (oldColumn = 0; oldColumn < GRID_COLUMNS; oldColumn++) {
        oldRow = grid[oldColumn].indexOf(socket);
        if (oldRow != -1) {
            break;
        }
    }

    // Delete client from grid
    if (oldRow != -1) {
        console.log('remove client at ' + oldColumn + ', ' + oldRow);
        grid[oldColumn][oldRow] = undefined;
        socketCounter--;
    }
}

// Look up a socket in the grid and return its row and column indexes
function findSocketInGrid(socket) {
    for (var column = 0; column < GRID_COLUMNS; column++) {
        for (var row = 0; row < GRID_ROWS; row++) {
            if (grid[column][row] == socket) {
                return { row: row, column: column };
            }
        }
    }
    return; // undefined
}

function findNextSocket(socket) {
    // find position of current socket
    var position = findSocketInGrid(socket);
    if (typeof(position) == 'undefined')
        return; // undefined

    // find "next" socket (grid is traversed horizontally)
    var row = position.row;
    var column = position.column;
    console.log('looking for successor of grid[', column, '][', row, ']');

    // scan current row from next column to last column
    for (column = position.column + 1; column < GRID_COLUMNS; column++) {
        console.log('scan1 (until end of current row): typeof(grid[', column, '][', row, ']) =', typeof(grid[column][row]));
        if ((typeof(grid[column][row]) !== 'undefined')) {
            console.log('next socket found');
            return grid[column][row];
        }
    }
    // scan from first column of next row to end of grid
    for (row = position.row + 1; row < GRID_ROWS; row++) {
        for (column = 0; column < GRID_COLUMNS; column++) {
            console.log('scan2 (rows below): typeof(grid[', column, '][', row, ']) =', typeof(grid[column][row]));
            if ((typeof(grid[column][row]) !== 'undefined')) {
                console.log('next socket found');
                return grid[column][row];
            }
        }
    }
    // scan from beginning of grid to current socket
    for (row = 0; row <= position.row; row++) {
        for (column = 0; column <= position.column; column++) {
            console.log('scan3 (from beginning to current): typeof(grid[', column, '][', row, ']) =', typeof(grid[column][row]));
            if ((typeof(grid[column][row]) !== 'undefined')) {
                console.log('next socket found');
                return grid[column][row];
            }
        }
    }

    // socket not found
    console.log('next socket NOT found');
    return; // undefined
}

module.exports = function (opts) {

    io = opts.io;

    io.sockets.on('connection', function (socket) {
        // Add client to first available position in the grid
        // upsertClient(socket, -1, -1);
        var position = addClient(socket);
        if (typeof(position !== 'undefined')) {
            // Inform client of position
            this.emit('position', position);
            if (socketCounter == 1) {
                console.log('first client detected, sending start signal');
                this.emit('start');
            }
        } else {
            this.emit('server full');
        }

        socket.on('config', function (data) {
            upsertClient(this, data.column, data.row);
        });

        socket.on('disconnect', function (data) {
            removeClient(this);
        });

        socket.on('startnext', function (data) {
            console.log('received startnext from ', findSocketInGrid(this), data);
            var next = findNextSocket(this);
            if (typeof(next) !== 'undefined') {
                console.log('sending start to ', findSocketInGrid(next));
                next.emit('start', data);
            } else {

            }
        });
    });
    return {rows: GRID_ROWS, cols: GRID_COLUMNS};
};

requirejs(['sensor'], function (Sensor) {
    var sensor = new Sensor();
    sensor.on('on', function () {
        console.log('SENSOR -> hand detected');
        colorHandCycle();
    });
    sensor.on('off', function () {
        console.log('SENSOR -> hand removed');
    });
    sensor.on('distance', function (cm) {
        console.log('SENSOR -> hand at', cm, ' cm');
    });
    sensor.connect('/dev/tty.usbserial-A6004bpf');
});

var cycleHand;

function clearHandCycle() {
    if (cycleHand) {
        clearInterval(cycleHand);
    }
}

function colorHandCycle() {
    clearHandCycle();
    clearStdCycle();
    var round = -1;

    function resp() {
        console.log('RESP');
        round++;
        if (round > GRID_ROWS) {
            clearHandCycle();
            colorStdCycle();
        } else if (round >= GRID_ROWS) {
            setAllScreensTo('#000000');
        } else {
            for (var i = 0; i < GRID_ROWS; i++) {
                var color = round === i ? '#fcf395' : '#000000';
                console.log('setting row ', i, ' round ', round, color);
                setRowScreensTo(i, color);
            }
        }
    }

    cycleHand = setInterval(resp, 300);
    setAllScreensTo('#000000');
}


var advance = 10;
var colorCounter = 0;
var beat = 0;

function setRowScreensTo(row, color) {
    for (var column = 0; column < GRID_COLUMNS; column++) {
        var clientSocket = grid[column][row];
        if (clientSocket) {
            clientSocket.emit('update', { bgcolor: color });
        }
    }
}

function setAllScreensTo(color) {
    for (var column = 0; column < GRID_COLUMNS; column++) {
        for (var row = 0; row < GRID_ROWS; row++) {
            var clientSocket = grid[column][row];
            if (clientSocket) {
                clientSocket.emit('update', { bgcolor: color });
            }
        }
    }
}

function setColumnScreensTo(column, color) {
    for (var row = 0; row < GRID_ROWS; row++) {
        var clientSocket = grid[column][row];
        if (clientSocket) {
            clientSocket.emit('update', { bgcolor: color });
        }
    }
}

var colorCounter = 0;
var colors = ['#f8a984', '#e7ab7e',
    '#d7ae78', '#c7b172', '#b7b26b', '#a6b363',
    '#94b45b', '#81b553', '#6ab54c', '#4db748',
    '#53b956', '#57bb68', '#5bbd7c', '#5ebf8d',
    '#62c29d', '#65c4af', '#68c7c0', '#6bcad2',
    '#6dcce4', '#84c8d7', '#97c5cc', '#a8c2c2',
    '#b7bfb7', '#c5bbad', '#d3b7a2',
    '#dfb298', '#ebad8e'];
//colors = ['#FF0000','#00FF00','#0000FF'];

function tick() {
    //console.log('tick');

    for (var column = 0; column < GRID_COLUMNS; column++) {
        var colorIdx = colorCounter + column;
        setColumnScreensTo(column, colors[colorIdx % colors.length]);
    }
    colorCounter++;
    colorCounter = colorCounter % colors.length;
    // Update all clients...
    /*for (var column = 0; column < GRID_COLUMNS; column++) {
     for (var row = 0; row < GRID_ROWS; row++) {
     var clientSocket = grid[column][row];

     var clientNo = column * GRID_ROWS + row;

     var strColor = '#000000';
     if (mode == MODE_OFF) {
     // none

     } else if (mode == MODE_COLOR_CYCLE_SYNC) {
     var color = colorCounter + clientNo * advance;
     if (color > 255) {
     color = color - 255;
     }
     strColor = '#' + (255 * 255 * color + 255 * 255 + color).toString(16);

     } else if (mode == MODE_COLOR_CYCLE_SNAKE) {
     var color = colorCounter + clientNo * advance;
     if (color > 255) {
     color = color - 255;
     }
     strColor = '#' + (255 * 255 * color + 255 * 255 + color).toString(16);

     }

     if (clientSocket) {
     clientSocket.emit('update', { bgcolor: strColor });
     }
     }
     }

     if (mode == MODE_COLOR_CYCLE_SNAKE ||
     mode == MODE_COLOR_CYCLE_SYNC) {

     colorCounter++;
     if (colorCounter >= 255) {
     colorCounter = 0;
     }

     }
     beat++;

     if (beat % 100 == 0) {
     //mode++;
     }*/
}

var standardCycle;


function clearStdCycle() {
    if (standardCycle) {
        clearInterval(standardCycle);
    }
}

function colorStdCycle() {
    clearHandCycle();
    clearStdCycle();
    standardCycle = setInterval(tick, 300);
}

colorStdCycle();