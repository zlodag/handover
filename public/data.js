"use strict";
angular.module('handover.data',['firebase','firebase.auth'])
// .factory("FB",["$window", function($window){
// 	return new $window.Firebase("https://nutm.firebaseio.com");
// }])
.factory("TIMESTAMP",["$window",function($window){
	return $window.Firebase.ServerValue.TIMESTAMP;
}])
.factory('Stamp',['Auth','TIMESTAMP',function(Auth,TIMESTAMP){
	return function(){
		this.at = TIMESTAMP;
		this.by = Auth.$getAuth().uid;
	};
}])
.factory('Wards',['fbutil','$firebaseArray',function(fbutil,$firebaseArray){
	return $firebaseArray(fbutil.ref('wards'));
}])
.factory('Specialties',['fbutil','$firebaseArray',function(fbutil,$firebaseArray){
	return $firebaseArray(fbutil.ref('specialties'));
}])
.factory('Roles',['fbutil','$firebaseArray',function(fbutil,$firebaseArray){
	return $firebaseArray(fbutil.ref('roles'));
}])
.factory('Users',['fbutil','$firebaseArray',function(fbutil,$firebaseArray){
	return $firebaseArray.$extend({
		getName: function(uid){
			var user = this.$getRecord(uid);
			if (user) {
				return user.first + ' ' + user.last + ' (' + user.role + ')';
			} else {
				return '...';
			}
		}
	})(fbutil.ref('users').orderByChild('last'));
}])
.factory('UserDetailFactory',['fbutil','$firebaseObject',function(fbutil,$firebaseObject){
	return function(uid){
		return $firebaseObject(fbutil.ref('users',uid));
	};
}])
;
