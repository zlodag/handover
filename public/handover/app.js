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
.run(function($rootScope, $state, Auth) {
	Auth.$onAuth(function(authData) {
		if (!authData){
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
