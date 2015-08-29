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
.run(function($rootScope, $state, Profile,FB) {
	var ref;
	FB.onAuth(function(authData){
		if (authData){
			ref = FB.child('users').child(authData.uid);
			ref.on('value', updateInfo, errorHandler);
		} else {
			if(ref){
				console.log('You have been unauthenticated');
				ref.off('value', updateInfo);
			}
			$state.go("login");
		}
	});
	function updateInfo(snap){
		console.log('Your new user profile was retrieved',snap.val());
		Profile.info = snap.val();
		if(!$rootScope.$$phase) {$rootScope.$apply();}
	}
	function errorHandler(error){
		console.error(error);
		Profile.info = null;
		if(!$rootScope.$$phase) {$rootScope.$apply();}
	}
	$rootScope.Profile = Profile;
	$rootScope.$on("$stateChangeError", function(event, next, previous, error) {
		console.error('The error was: ', error);
		if (error === "AUTH_REQUIRED") {
			console.error('Authentication required');
			$state.go("login");
		}
	});
})

;
})();
