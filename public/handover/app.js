(function(){angular.module('handover',[
 	'ui.router',
 	'ui.bootstrap',
 	'handover.login',
 	'handover.profile',
 	'handover.tasks',
 	'handover.data'
])
.config(function($urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise("/login");
	$locationProvider.html5Mode(true);
})
.run(function($rootScope, $state, Auth, $window,$firebaseObject) {
	Auth.$onAuth(function(authData) {
		if (authData) {
			var ref = new $window.Firebase("https://nutm.firebaseio.com/users").child(authData.uid).child('public');
			$rootScope.profile = $firebaseObject(ref);
		} else {
			if ($rootScope.profile) { $rootScope.profile.$destroy(); }
			console.log('Logged out');
			$state.go("login");
		}
	});
	// $rootScope.$on("$stateChangeError", console.log.bind(console));
	$rootScope.$on("$stateChangeError", function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			console.error('Authentication required');
			$state.go("login");
		}
	});
})

;
})();
