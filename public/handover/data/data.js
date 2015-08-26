(function(){angular.module('handover.data',['firebase'])
.constant("FBURL", "https://nutm.firebaseio.com")
.factory("FB",["$window","FBURL",function($window,FBURL){
	return new $window.Firebase(FBURL);
}])
.factory("TIMESTAMP",["$window",function($window){
	return $window.Firebase.ServerValue.TIMESTAMP;
}])
.factory("Auth", function(FB,$firebaseAuth) {
	return $firebaseAuth(FB);
})
.factory('specialtyArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("specialties"));
})
.factory('roleArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("roles"));
})
.factory('wardArray',function(FB,$firebaseArray) {
	return $firebaseArray(FB.child("wards"));
})
.factory('userFactory', function(FB,$firebaseObject) {
	return function(userId){
		return $firebaseObject(FB.child('users').child(userId));
	}
})
.factory('Profile',function(userFactory){
	var user = null;
	return {
		get user(){
			return user;
		},
		set : function(userId) {
			user = userFactory(userId);
		},
		del : function() {
			if (user) {user.$destroy();}
			user = null;
		}
	};
})
.factory('Stamp',function(Auth,Profile,TIMESTAMP){
	return function() {
		var authData = Auth.$getAuth(),
		user = Profile.user;
		return {
			at: TIMESTAMP,
			by: user.firstname + ' ' + user.lastname,
			id: authData.uid
		};
	}
})
;
})();
