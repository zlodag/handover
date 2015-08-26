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
.run(function($rootScope, $state, Auth, Profile) {
	$rootScope.Profile = Profile;
	Auth.$onAuth(function(authData) {
		$rootScope.auth = authData;
		if (authData) {
			Profile.set(authData.uid);
		} else {
			Profile.del();
			console.log('Logged out');
			$state.go("login");
		}
	});
	$rootScope.$on("$stateChangeError", function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			console.error('Authentication required');
			$state.go("login");
		}
	});
})

;
})();
