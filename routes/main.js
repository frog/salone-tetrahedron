/*
 * GET home page or other pages
 */
module.exports = function(opts) {

    var app = opts.app;

    app.get('/', function(req, res) {
		res.render('main_view', {});
    });

    app.get('/tetralogo', function(req, res) {
		res.render('tetralogo', {});
    });
};

