
/*
 * GET home page.
 */
module.exports = function(opts) {

    var app = opts.app;

    app.get('/', function(req, res) {
		res.render('main_view', { 
		});

    });

};

