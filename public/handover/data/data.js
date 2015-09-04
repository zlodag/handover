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
.factory('rolesPromise', function(FB,$q){
	var deferred = $q.defer();
	console.log('about to find the different roles');
	FB.child("roles").once('value',function(snap){
		console.log('got the different roles');
		deferred.resolve(snap.val());
	}, function(error){
		deferred.reject(error);
	});
	return deferred.promise;
})
.factory('Profile',function(FB,$q,$state){
	var info,
	auth,
	ref,
	watching = [];
	FB.onAuth(function(authData){
		auth = authData;
		if (!authData){
			info = null;
		}
	});
	function addWatcher(ref){
		watching.push(ref);
	}
	function goToProfile(uid){
		console.log('Going to profile with uid: ' + uid);
		$state.go('profile.public',{userId:uid});
	}
	function makeProfile(obj){
		var deferred = $q.defer(),
		profileData = {f: obj.name.first, l: obj.name.last, r: obj.role};
		FB.child('users/index/' + obj.authData.uid).set(profileData, function(error){
			if (error){
				deferred.reject(error);
			}
			else {
				console.log('Successfully set userdata',profileData);
				deferred.resolve(obj.authData.uid);
			}
		});
		return deferred.promise;
	}
	function ensureAuth() {
		var deferred = $q.defer();
		if (!auth) {deferred.reject('Not authorised');}
		else {
			getProfile(auth.uid).then(function(uid){
				deferred.resolve(uid);
			}).catch(function(error){
				deferred.reject(error);
			});
		}
		return deferred.promise;
	}
	function newAccount(credentials) {
		var deferred = $q.defer();
		if (!credentials || !credentials.firstname || !credentials.lastname || !credentials.role) {
			deferred.reject('Provide a first name, last name and role');
		} else {
			var firstname = credentials.firstname,
			lastname = credentials.lastname,
			role = credentials.role,
			email = credentials.email,
			password = credentials.password;
			if (email && password) {
				var details = {email: email, password: password};
				FB.createUser(details, function(error){
					if (error){
						deferred.reject(error);
					} else {
						console.log('Created user successfully');
						FB.authWithPassword(details, function(error,authData){
							if (error){
								deferred.reject(error);
							} else {
								console.log('Authed in as new user', authData);
								deferred.resolve({authData: authData, name: {first: firstname, last: lastname}, role: role});
							}
						});
					}
				});
			} else {
				FB.authAnonymously(function(error,authData){
					if (error){
						deferred.reject(error);
					} else {
						console.log('Authed in as anonymous user', authData);
						deferred.resolve({authData: authData, name: {first: firstname, last: lastname}, role: role});
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
	function getProfile(uid) {
		var deferred = $q.defer();
		if (info) {deferred.resolve(uid);}
		else {
			ref = FB.child('users/index/' + uid);
			ref.on('value', function(snap){
				info = snap.val();
				console.log('about to resolve',deferred.promise);
				deferred.resolve(uid);
			},function(error){
				deferred.reject(error);
			});
			addWatcher(ref);
		}
		return deferred.promise;
	}
	function register(credentials){
		return newAccount(credentials).then(makeProfile).then(getProfile).then(goToProfile);
	}
	function login(credentials){
		return passwordAuth(credentials).then(getProfile).then(goToProfile);
	}
	function logout(){
		for (var i = 0; i < watching.length; i++) {
			var ref = watching[i];
			console.log('Removing callback for ref: ' +  ref.toString());
			ref.off();
		}
		watching = [];
		console.log('Logging out');
		FB.unauth();
		$state.go("login");
	}
	return {
		set info(value){ info = value; },
		get info(){ return info; },
		get auth(){ return auth; },
		get ref(){ return ref; },
		login : login,
		logout: logout,
		register : register,
		addWatcher: addWatcher,
		ensureAuth: ensureAuth
	};
})
.factory('Stamp',function(Profile,TIMESTAMP){
	return function(){
		return {
		at: TIMESTAMP,
		by: Profile.info.f + ' ' + Profile.info.l,
		id: Profile.auth.uid
		};
	};
})
;
})();
