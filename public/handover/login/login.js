(function(){angular.module('handover.login',['ui.router','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('admin', {
		url: '/admin',
		template: '<p>Admin stuff here</p>'
	})
	.state('login', {
		url: "/login",
		templateUrl: "/handover/login/login.html",
		resolve: {
			wait: function(Auth) {
				//return Auth;
				return Auth.$waitForAuth();
		    }
		},
		controller: 'loginController'
	})
	// .state('logout', {
	// 	url: "/logout",
	// 	// templateUrl: "/handover/login/login.html",
	// 	resolve: {
	// 		logout: function(Auth) {
	// 			//return Auth;
	// 			return Auth.$unauth();

	// 			// return Auth.$waitForAuth();
	// 	    },
	// 	    redirect: function(logout,$state){
	// 	    	$state.go('login');
	// 	    }
	// 	}
	// })
})
.controller('loginController',function($scope,Auth,$state){
	$scope.login = function(credentials){
		Auth.$authWithPassword(credentials)
		.then(function(authData) {
			console.log("Logged in as:", authData.uid);
			$state.go('profile.public',{userId:authData.uid});
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
	};
})
})();
