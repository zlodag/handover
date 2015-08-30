var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*',function(req, res, next) {
	res.render('index',{
	  	scripts: [
			'/angular/angular',
			'/firebase/firebase-debug',
			'/angularfire/dist/angularfire',
			'/angular-ui-router/release/angular-ui-router',
	  		'/angular-bootstrap/ui-bootstrap-tpls',
	  		// '/angular-loading-bar/build/loading-bar',
	  		'/handover/app',
	  		'/handover/login/login',
	  		'/handover/profile/profile',
	  		'/handover/data/data',
	  		'/handover/addons/navbar',
	  		'/handover/tasks/tasks'
		],
		styles : [
			'/bootstrap-css-only/css/bootstrap.min',
			'/styles/style',
			'/styles/overview'
		]
  	});
});
router.use(function(req, res, next) {
	res.redirect('/');
});

module.exports = router;
