(function(){angular.module('handover.profile',['ui.router','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('profile', {
		abstract: true,
		url: "/profile/:userId",
		templateUrl: "/handover/profile/profile.html",
		resolve: {
			// authData: function(Auth) {
			// 	//return Auth;
			// 	return Auth.$requireAuth();
		 //    },
		    // canEdit: function(authData,$stateParams){
		    // 	return authData.uid === $stateParams.userId;
		    // },
		    isMe: function($stateParams,Profile){
		    	return $stateParams.userId === Profile.auth.uid;
		    },
		    userRef: function(isMe,FB,$stateParams){
		    	if (isMe) {return Profile.ref;}
		    	else {return FB.child('users').child($stateParams.userId);}
		    }

		    // user: function(userFactory,$stateParams) {
		    // 	return userFactory($stateParams.userId).$loaded();
		    // }
		},
		controller: 'profileController'
	})
	.state('profile.edit', {
		url: '/edit',
		templateUrl: "/handover/profile/edit.html",
		// template: '<p>Resolved!</p>',
		resolve: {
			// allow: function($q,canEdit){
			// 	var deferred = $q.defer();
			// 	if (canEdit) {
   //                  deferred.resolve();
   //              } else {
   //                  deferred.reject('You cannot edit another profile!');
   //              }
   //              return deferred.promise;
			// },
			specialties: function(specialtyArray){
		    	return specialtyArray.$loaded();
		    },
			roles: function(roleArray){
		    	return roleArray.$loaded();
		    }
		},
		controller: 'profileEditController'
	})
	.state('profile.public',{
		url: '/',
		template: '<a class="btn btn-default" ui-sref="^.edit">Edit</a>'
	});
})
.controller('profileController',function($scope,isMe,userRef,Profile){
	var info;
	if (isMe) {
		$scope.getInfo = function(){return Profile.info;}
	} else {
		userRef.on('value',function(snap){
			info = snap.val();
			if(!$scope.$$phase) {$scope.$apply();}
		});
		Profile.addWatcher(userRef);
		$scope.getInfo = function(){return info;}
	}
})
.controller('profileEditController',function($scope,
            // user,
            //Profile,
            specialties,roles,FB,userRef){
	$scope.specialties = specialties;
	$scope.roles = roles;
	//$scope.user = Profile; //debug
	FB.onAuth(function(authData) {if (!authData){
		specialties.$destroy();
		roles.$destroy();
	}});
	var user = $scope.user;
	$scope.newUser = {};
	if(user.firstname){$scope.newUser.firstname = user.firstname}
	if(user.lastname){$scope.newUser.lastname = user.lastname}
	if(user.contact){$scope.newUser.contact = user.contact}
	if(user.specialty && specialties.$indexFor(user.specialty) !== -1){$scope.newUser.specialty = user.specialty}
	if(user.role && roles.$indexFor(user.role) !== -1){$scope.newUser.role = user.role}
	$scope.update = function(newUser){
		if (!newUser.contact){delete newUser.contact;}
		userRef.set(newUser);
	};
})
;
})();
