(function(){
	angular.module('handover.data',['firebase'])
		.factory("FB",["$window", function($window){
			return new $window.Firebase("https://nutm.firebaseio.com");
		}])
		.factory("TIMESTAMP",["$window",function($window){
			return $window.Firebase.ServerValue.TIMESTAMP;
		}])
		.factory('Hospital',['FB','$firebaseArray',function(FB,$firebaseArray){
			return {
				wards: $firebaseArray(FB.child('wards')),
				specialties: $firebaseArray(FB.child('specialties')),
				roles: $firebaseArray(FB.child('roles'))
			};
		}])
		.factory('Users',['FB','$firebaseArray',function(FB,$firebaseArray){
			return $firebaseArray.$extend({
				getName: function(uid){
					var user = this.$getRecord(uid);
					if (user) {
						return user.first + ' ' + user.last + ' (' + user.role + ')';
					} else {
						return '...';
					}
				}
			})(FB.child('users').orderByChild('last'));
		}])
		.factory('UserDetailFactory',['FB','$firebaseObject',function(FB,$firebaseObject){
			return function(uid){
				return $firebaseObject(FB.child('users').child(uid));
			};
		}])
	;
})();
