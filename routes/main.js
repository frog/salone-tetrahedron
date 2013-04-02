/*
 * GET home page or other pages
 */
module.exports = function(opts) {

    var app = opts.app;

    app.get('/', function(req, res) {
		res.render('main_view', {
		  title: 'Main view'
		});
    });

    app.get('/tetralogo', function(req, res) {
		res.render('tetralogo', {
		  title: 'Tetralogo'
		});
    });

    app.get('/tetralogomulti', function(req, res) {
		res.render('tetralogo_multi', {
		  title: 'Tetralogo multi'
		});
    });

    app.get('/test_grid', function(req, res) {
		res.render('test_grid', {
		  title: 'close me after you\'ve done',
          grid: opts.grid
		});
    });

};

