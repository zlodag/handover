var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*',function(req, res, next) {
	res.render('index',{
	  	scripts: [
			'/angular/angular',
			'/firebase/firebase',
			'/angularfire/dist/angularfire',
			'/angular-ui-router/release/angular-ui-router',
	  		'/angular-bootstrap/ui-bootstrap-tpls',
	  		// '/angular-loading-bar/build/loading-bar',
	  		'/handover/app',
	  		'/handover/auth/auth',
	  		'/handover/navbar/navbar',
	  		'/handover/tasks/tasks'
		],
		styles : [
			'/bootstrap-css-only/css/bootstrap.min',
			'/styles/style'
		]
  	});
});
router.use(function(req, res, next) {
	res.redirect('/');
});

module.exports = router;
