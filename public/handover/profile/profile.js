(function(){angular.module('handover.profile',['ui.router','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('profile', {
		abstract: true,
		url: "/profile/:userId",
		templateUrl: "/handover/profile/profile.html",
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
		templateUrl: "/handover/profile/edit.html",
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
	});
})
.controller('profilePublicController',function($scope,canEdit,publicData,$rootScope){
	$rootScope.$on("logout", function() {
		publicData.$destroy();
	});
	$scope.publicData = publicData;
	$scope.canEdit = canEdit;
})
.controller('profilePrivateController',function($scope,specialties,privateData,publicData,$rootScope){
	$scope.specialties = specialties;
	$scope.privateData = privateData;
	$rootScope.$on("logout", function() {
		specialties.$destroy();
		privateData.$destroy();
	});
	$scope.newUser = {}
	if(publicData.firstname){$scope.newUser.firstname = publicData.firstname}
	if(publicData.lastname){$scope.newUser.lastname = publicData.lastname}
	if(publicData.contact){$scope.newUser.contact = publicData.contact}
	if(publicData.specialty && specialties.$indexFor(publicData.specialty) !== -1){$scope.newUser.specialty = publicData.specialty}
	$scope.update = function(newUser){
		if (!newUser.contact){delete newUser.contact;}
		publicData.$ref().set(newUser);
	};
})
;
})();
