(function(){angular.module('handover',[
 	'ngAnimate',
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
.run(function($rootScope, $state, Profile, $window, FB) {
	$window.Firebase.enableLogging(false);
	$rootScope.Profile = Profile;
	FB.onAuth(function(authData){
		if(authData){
			Profile.ensureAuth();
		}
	});
	$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
		console.error('The error was: ', error);
		if (error === "AUTH_REQUIRED") {
			console.error('Authentication required');
			$state.go("login");
		}
	});
})
;
})();
