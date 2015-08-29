(function(){angular.module('handover.data',['firebase'])
.constant("FBURL", "https://nutm.firebaseio.com")
.factory("FB",["$window","FBURL",function($window,FBURL){
	return new $window.Firebase(FBURL);
}])
.factory("TIMESTAMP",["$window",function($window){
	return $window.Firebase.ServerValue.TIMESTAMP;
}])
// .factory("Auth", function(FB,$firebaseAuth) {
// 	return $firebaseAuth(FB);
// })
.factory('specialtyArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("specialties"));
})
.factory('roleArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("roles"));
})
.factory('wardArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("wards"));
})
.factory('allUsers', function(FB,$firebaseObject) {
	return $firebaseObject(FB.child("users"));
})
.factory('userFactory', function(FB,$firebaseObject) {
	return function(userId){
		return $firebaseObject(FB.child('users').child(userId));
	}
})
.factory('Profile',function(FB,$q,$state){
	var info = null,
	auth = null;
	FB.onAuth(function(authData){
		auth = authData;
		if (!authData){
			info = null;
		}
	});
	function goToProfile(uid){
		$state.go('profile.public',{userId:uid});
	}
	function makeProfile(obj){
		var deferred = $q.defer();
		FB.child('users').child(obj.authData.uid).set({firstname: obj.name.first, lastname: obj.name.last},function(error){
			if (error){
				deferred.reject(error);
			}
			else {
				deferred.resolve(obj.authData.uid);
			}
		});
		return deferred;
	}
	function newAccount(credentials) {
		var deferred = $q.defer();
		if (!credentials || !credentials.firstname || !credentials.lastname) {
			deferred.reject('Provide a first and last name');
		} else {
			var firstname = credentials.firstname,
			lastname = credentials.lastname,
			email = credentials.email,
			password = credentials.password;
			if (email && password) {
				var details = {email: email, password: password};
				FB.createUser(details, function(error){
					if (error){
						deferred.reject(error);
					} else {
						FB.authWithPassword(details, function(error,authData){
							if (error){
								deferred.reject(error);
							} else {
								deferred.resolve({authData: authData, name: {first: firstname, last: lastname}});
							}
						});
					}
				});
			} else {
				FB.authAnonymously(function(error,authData){
					if (error){
						deferred.reject(error);
					} else {
						deferred.resolve({authData: authData, name: {first: firstname, last: lastname}});
					}
				});
			}
		}
		return deferred.promise;
	}
	function passwordAuth(credentials) {
		var deferred = $q.defer();
		FB.authWithPassword(credentials, function(error,authData){
			if (error){
				deferred.reject(error);
			} else {
				deferred.resolve(authData.uid);
			}
		});
		return deferred.promise;
	}
	function register(credentials){
		return newAccount(credentials).then(makeProfile).then(goToProfile);
	}
	function login(credentials){
		return passwordAuth(credentials).then(goToProfile);
	}
	function logout(){
		FB.unauth();
	}
	return {
		set info(value){ info = value; },
		get info(){ return info; },
		get auth(){ return auth; },
		login : login,
		logout: logout,
		register : register
	};
})
.factory('Stamp',function(Profile,TIMESTAMP){
	return {
		at: TIMESTAMP,
		by: Profile.info.firstname + ' ' + Profile.info.lastname,
		id: Profile.auth.uid
	};
})
;
})();
