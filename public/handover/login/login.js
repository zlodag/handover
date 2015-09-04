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
		resolve: {
			roles: function(rolesPromise){
				return rolesPromise;
			}
		},
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
.controller('registerController',function($scope,Profile,roles){
	$scope.register = Profile.register;
	$scope.roles = roles;
	console.log('The roles are now', $scope.roles);
	// roles.then(function(){console.log('The roles are now', $scope.roles);});
})
.controller('loginController',function($scope,Profile){
	$scope.login = Profile.login;
})
})();
