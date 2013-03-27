
/*
 * GET home page.
 */
module.exports = function(opts) {

    var app = opts.app;
    var check = require('validator').check;
    var db = opts.db;
    var ObjectId = opts.ObjectId;


    app.get('/', function(req, res) {
		res.render('main_view', { 
		});

    });

};

