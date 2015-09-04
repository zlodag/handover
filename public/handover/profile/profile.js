(function(){angular.module('handover.profile',['ui.router','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('profile', {
		abstract: true,
		url: "/profile",
		template: "<ui-view />",
		resolve: {
		    ensureAuth: function(Profile){
		    	return Profile.ensureAuth();
		    }
		}
// 		controller: 'profileController'
	})
	.state('profile.edit', {
		url: '/edit',
		templateUrl: "/handover/profile/editProfile.html",
		resolve: {
			specialties: function(specialtyArray){
		    	return specialtyArray.$loaded();
		    },
			roles: function(roleArray){
		    	return roleArray.$loaded();
		    }
		},
		controller: function($scope,Profile,specialties,roles){
			$scope.specialties = specialties;
			Profile.addWatcher(specialties.$ref());
			$scope.roles = roles;
			Profile.addWatcher(roles.$ref());
			var user = $scope.user;
			$scope.newUser = {};
			if(Profile.info.f){$scope.newUser.firstname = Profile.info.f}
			if(Profile.info.l){$scope.newUser.lastname = Profile.info.l}
			if(Profile.info.contact){$scope.newUser.contact = Profile.info.contact}
			if(Profile.info.specialty && specialties.$indexFor(Profile.info.specialty) !== -1){$scope.newUser.specialty = Profile.info.specialty}
			if(Profile.info.r && roles.$indexFor(Profile.info.r) !== -1){$scope.newUser.role = Profile.info.r}
			$scope.update = function(newUser){
				if (!newUser.contact){delete newUser.contact;}
				Profile.ref.set(newUser);
			};
		}
	})
	.state('profile.public',{
		url: '/:userId',
		templateUrl: "/handover/profile/profile.html",
		resolve: {
			info: function($stateParams,FB,$q){
				var deferred = $q.defer();
				FB.child('users').child($stateParams.userId).once('value',function(snap){
					deferred.resolve(snap.val());
				}, function(error){
					deferred.reject(error);
				});
				return deferred.promise;
			}
		},
		controller: function($scope,info){
			$scope.info = info;
		}
	});
})
;
})();
