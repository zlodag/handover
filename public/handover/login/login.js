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
.controller('registerController',function($scope,Auth,$state,FB){
	$scope.createAccount = function(credentials) {
		var email = credentials.email,
		password = credentials.password,
		firstname = credentials.firstname,
		lastname = credentials.lastname;
        Auth.$createUser({
        	email: email,
        	password: password
		})
		.then(function() {
			return Auth.$authWithPassword({ email: email, password: password });
		})
		.then(
			function(user) {
				var ref = FB.child('users').child(user.uid);
				ref.set({firstname: firstname, lastname: lastname}, function(err){
					if (err) {
						console.error("Unable to update user profile", err);
					}
					else {
						$state.go('profile.public',{userId:user.uid});
					}
				});
			},
			function(err) {
            	console.error("Create user failed", err);
			}
		);
    };
})
.controller('loginController',function($scope,Auth,$state){

	$scope.login = function(credentials){
		Auth.$authWithPassword(credentials,{rememberMe: true})
		.then(function(authData) {
			console.log("Logged in as:", authData.uid);
			$state.go('tasks.overview');
			// $state.go('profile.public',{userId:authData.uid});
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
	};
})
})();
