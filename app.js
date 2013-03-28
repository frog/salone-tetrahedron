var DEV = true;

/**
 * Module dependencies.
 */

var express = require('express')
  , cons = require('consolidate')
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
var io = require('socket.io').listen(server, {log: false });
require('./salone')({app: app, io: io, DEV: DEV });






