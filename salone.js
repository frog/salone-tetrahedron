// Mode constants
var MODE_OFF = 0;
var MODE_COLOR_CYCLE_SYNC = 1;
var MODE_COLOR_CYCLE_SNAKE = 2;
var MODE_COLOR_CYCLE_MATRIX = 3;
  
// Grid dimensions
var GRID_COLUMNS = 4;
var GRID_ROWS = 4;

// Starting mode
var mode = MODE_COLOR_CYCLE_SNAKE;

// Allocate empty grid
// grid accessed using: grid[column_no][row_no]
var grid = Array(GRID_COLUMNS);
for (var i=0; i<GRID_COLUMNS; i++) {
  grid[i] = Array(GRID_ROWS);
}

function upsertClient(socket, row, column) {
  // Remove client from grid (if present)
  removeClient(socket);


  // Find insert position
  if (column<0) {
    // Find first available column
    for (column=0; column<GRID_COLUMNS; column++) {
      for (row=0; row<GRID_ROWS; row++) {
        if (typeof(grid[column][row]) == 'undefined') break;
      }
      if (row>=0) break;
    }
  }

  console.log("upsert at column ", column, ", row ", row);

  // Add client to grid
  grid[column][row] = socket;

  // Inform client of position
  socket.emit('position', { row: row, column: column });

}

function removeClient(socket) {
  // Check if client is present
  var oldRow = -1;
  var oldColumn;
  for (oldColumn=0; oldColumn<GRID_COLUMNS; oldColumn++) {
    row = grid[oldColumn].indexOf(socket);
    if (row != -1) {
      break;
    }
  }

  // Delete client from grid
  if (oldRow != -1) {
    grid[oldColumn][oldRow] = [];
  }
}



module.exports = function(opts) {

  io = opts.io;

  io.sockets.on('connection', function (socket) {
    // Add client to first available position in the grid
    upsertClient(socket, -1, -1);

    socket.on('config', function (data) {
      upsertClient(this, data.column, data.row);
    });

    socket.on('disconnect', function (data) {
      removeClient(this);
    });

  });
};


var advance = 10;
var colorCounter = 0;
var beat = 0

setInterval((function() {

  //console.log('tick');

  // Update all clients...
  for (var column=0; column<GRID_COLUMNS; column++) {
    for (var row=0; row<GRID_ROWS; row++) {
      var clientSocket = grid[column][row];

        var clientNo = column*GRID_ROWS + row;

        var strColor = '#000000';
        if (mode == MODE_OFF) {
          // none

        } else if (mode == MODE_COLOR_CYCLE_SYNC) {
          var color = colorCounter + clientNo*advance;
          if (color>255) {
              color = color-255;
          }
          strColor = '#' + (255*255*color + 255*255 + color).toString(16);

        } else if (mode == MODE_COLOR_CYCLE_SNAKE) {
          var color = colorCounter + clientNo*advance;
          if (color>255) {
              color = color-255;
          }
          strColor = '#' + (255*255*color + 255*255 + color).toString(16);

        }

        if (clientSocket) {
          clientSocket.emit('update', { bgcolor: strColor });
        }
    }
  }

  if (mode == MODE_COLOR_CYCLE_SNAKE ||
      mode == MODE_COLOR_CYCLE_SYNC) {

    colorCounter++;
    if (colorCounter>=255) {
      colorCounter = 0;
    }

  }
  beat++;

  if (beat%100 == 0) {
   //mode++;
  }

}), 100);

