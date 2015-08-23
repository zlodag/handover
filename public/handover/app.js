(function(){angular.module('handover',['ui.router','ui.bootstrap','handover.tasks','handover.auth'])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise("/login");
	$stateProvider
	.state('login', {
		url: "/login",
		templateUrl: "/handover/templates/login.html",
		resolve: {
			wait: ["Auth", function(Auth) {
				//return Auth;
				return Auth.$waitForAuth();
		    }]
		},
		controller: 'loginController'
	})
	.state('profile', {
		abstract: true,
		url: "/profile/:userId",
		templateUrl: "/handover/templates/profile.html",
		resolve: {
			authData: function(Auth) {
				//return Auth;
				return Auth.$requireAuth();
		    },
		    canEdit: function(authData,$stateParams){
		    	return authData.uid === $stateParams.userId;
		    },
		    userRef: function($window,$stateParams) {
		    	return new $window.Firebase("https://nutm.firebaseio.com/users").child($stateParams.userId);
		    },
			publicData: function(userRef, $firebaseObject){
				var ref = userRef.child('public');
				return $firebaseObject(ref).$loaded();
			}
		},
		controller: 'profilePublicController'
	})
	.state('profile.public',{
		url: '/',
		template: '<a ng-if="canEdit" class="btn btn-default" ui-sref="^.edit">Edit</a>'
	})
	.state('profile.edit', {
		url: '/edit',
		templateUrl: "/handover/templates/editProfile.html",
		// template: '<p>Resolved!</p>',
		resolve: {
			allow: function($q,canEdit){
				var deferred = $q.defer();
				if (canEdit) {
                    deferred.resolve();
                } else {
                    deferred.reject('You cannot edit another profile!');
                }
                return deferred.promise;
			},
			specialties: function(specialtyArray){
		    	return specialtyArray.$loaded();
		    },
			privateData: function(userRef, $firebaseArray){
				var ref = userRef.child('private');
				return $firebaseArray(ref).$loaded();
			}
		},
		controller: 'profilePrivateController'
	})
	.state('admin', {
		url: "/admin",
		templateUrl: "/handover/templates/admin.html"
	})
	$locationProvider.html5Mode(true);
})
.run(function($rootScope, $state, Auth) {
	Auth.$onAuth(function(authData) {
		$rootScope.auth = authData;
		if (!authData){$state.go("login");}
	});
	$rootScope.$on("$stateChangeError", console.log.bind(console));
	$rootScope.$on("$stateChangeError", function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			console.error('Authentication required');
			$state.go("login");
		}
	});
})
.controller('loginController',function($scope,Auth){
	$scope.login = function(credentials){
		Auth.$authWithPassword(credentials)
		.then(function(authData) {
			console.log("Logged in as:", authData.uid);
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
	};
})
.controller('profilePublicController',function($scope,canEdit,publicData){
	$scope.publicData = publicData;
	$scope.canEdit = canEdit;
})
.controller('profilePrivateController',function($scope,specialties,privateData,publicData){
	// console.log(specialties,privateData,publicData);
	$scope.specialties = specialties;
	$scope.privateData = privateData;
	$scope.newUser = {}
	if(publicData.firstname){$scope.newUser.firstname = publicData.firstname}
	if(publicData.lastname){$scope.newUser.lastname = publicData.lastname}
	if(publicData.contact){$scope.newUser.contact = publicData.contact}
	if(publicData.specialty && specialties.$indexFor(publicData.specialty) !== -1){$scope.newUser.specialty = publicData.specialty}
	$scope.update = function(newUser){
		if (!newUser.contact){delete newUser.contact;}
		console.log(newUser);
		publicData.$ref().set(newUser);
	};
})
.factory('specialtyArray',function($firebaseArray,$window) {
	var ref = new $window.Firebase("https://nutm.firebaseio.com/specialties");
	return $firebaseArray(ref);
})
;
})();
