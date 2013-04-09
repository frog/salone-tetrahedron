var DEV = true;

/**
 * Module dependencies.
 */

var express = require('express')
    , cons = require('consolidate')
    , http = require('http')
    , util = require('util')
    , path = require('path')
    , requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
});

var app = express();


// assign the dust engine to .dust files
app.engine('dust', cons.dust);

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'dust');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
app.configure('production', function () {
    app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("SERVER  " +getIPAddress()+":"+app.get('port'));
});

// Socket.io
var io = require('socket.io').listen(server, {log: false });
var grid = require('./salone')({app: app, io: io, DEV: DEV });
require('./routes')({app: app, grid: grid});

function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }

  return '0.0.0.0';
}





