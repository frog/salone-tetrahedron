var DEV = true;

var MODE_OFF = 0;
var MODE_COLOR_CYCLE_SYNC = 1;
var MODE_COLOR_CYCLE_SNAKE = 2;
var MODE_COLOR_CYCLE_MATRIX = 3;
  
// Starting mode
var mode = MODE_COLOR_CYCLE_SNAKE;


/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();


// assign the dust engine to .dust files
app.engine('dust', cons.dust);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'dust');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(expressValidator);
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});

require('./routes')({app: app});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Socket.io
var io = require('socket.io').listen(server, {log: false});
var clientList = [];
var clientCounter = 0;

io.sockets.on('connection', function (socket) {
  var client = {
    socket: socket,
    no: clientCounter
  }
  clientList.push(client);

  clientCounter++;



  socket.on('config', function (data) {
    // Find client
    for (i=0; i<clientList.length; i++) {
      if (clientList[i].socket == this) {
        // Store data
        clientList[i].row = data.row;
        clientList[i].column = data.column;
        console.log(data);
        break;
      }
    }

  });
});

var advance = 10;




colorCounter = 0;
beat = 0
setInterval((function() {

  // Update all clients...
  for (i=0; i<clientList.length; i++) {
    var client = clientList[i];
    //console.log('client no ', client.no);

    var strColor = '#000000';
    if (mode == MODE_OFF) {
      // none

    } else if (mode == MODE_COLOR_CYCLE_SYNC) {
      var color = colorCounter + client.no*advance;
      if (color>255) {
          color = color-255;
      }
      strColor = '#' + (255*255*color + 255*255 + color).toString(16);

    } else if (mode == MODE_COLOR_CYCLE_SNAKE) {
      var color = colorCounter + client.no*advance;
      if (color>255) {
          color = color-255;
      }
      strColor = '#' + (255*255*color + 255*255 + color).toString(16);

    }
    client.socket.emit('update', { bgcolor: strColor });
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





