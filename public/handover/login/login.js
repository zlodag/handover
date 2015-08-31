(function(){angular.module('handover.login',['ui.router','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	// .state('admin', {
	// 	url: '/admin',
	// 	template: '<p>Admin stuff here</p>'
	// })
	.state('login', {
		url: "/login",
		templateUrl: "/handover/login/login.html",
		controller: 'loginController'
	})
	.state('register', {
		url: "/register",
		templateUrl: "/handover/login/register.html",
		controller: 'registerController'
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
.controller('registerController',function($scope,Profile){
	$scope.register = Profile.register;
})
.controller('loginController',function($scope,Profile){
	$scope.login = Profile.login;
})
})();
