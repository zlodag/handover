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
		    user: function(userFactory,$stateParams) {
		    	return userFactory($stateParams.userId).$loaded();
		    }
		},
		controller: 'profileController'
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
			roles: function(roleArray){
		    	return roleArray.$loaded();
		    }
		},
		controller: 'profileEditController'
	});
})
.controller('profileController',function($scope,canEdit,user,Auth){
	Auth.$onAuth(function(authData) {if (!authData){
		user.$destroy();
	}});
	$scope.user = user;
	$scope.canEdit = canEdit;
})
.controller('profileEditController',function($scope,user,specialties,roles,Auth){
	$scope.specialties = specialties;
	$scope.roles = roles;
	Auth.$onAuth(function(authData) {if (!authData){
		specialties.$destroy();
		roles.$destroy();
	}});
	$scope.newUser = {}
	if(user.firstname){$scope.newUser.firstname = user.firstname}
	if(user.lastname){$scope.newUser.lastname = user.lastname}
	if(user.contact){$scope.newUser.contact = user.contact}
	if(user.specialty && specialties.$indexFor(user.specialty) !== -1){$scope.newUser.specialty = user.specialty}
	if(user.role && roles.$indexFor(user.role) !== -1){$scope.newUser.role = user.role}
	$scope.update = function(newUser){
		if (!newUser.contact){delete newUser.contact;}
		user.$ref().set(newUser);
	};
})
;
})();
