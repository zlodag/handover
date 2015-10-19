(function(){
	angular.module('handover.data',['firebase'])
		.factory("FB",["$window", function($window){
			return new $window.Firebase("https://nutm.firebaseio.com");
		}])
		.factory("TIMESTAMP",["$window",function($window){
			return $window.Firebase.ServerValue.TIMESTAMP;
		}])
		.factory('Hospital',['FB','$firebaseObject','$firebaseArray',function(FB,$firebaseObject,$firebaseArray){
			return {
				wards: $firebaseObject(FB.child('wards')),
				specialties: $firebaseArray(FB.child('specialties')),
				roles: $firebaseArray(FB.child('roles'))
			};
		}])
		.factory('Users',['FB','$firebaseObject',function(FB,$firebaseObject){
			return $firebaseObject.$extend({
				getName: function(uid){
					if (uid in this) {
						var user = this[uid];
						return user.first + ' ' + user.last + ' (' + user.role + ')';
					} else {
						return '...';
					}
				}
			})(FB.child('users'));
		}])
		.factory('UserDetailFactory',['FB','$firebaseObject',function(FB,$firebaseObject){
			return function(uid){
				return $firebaseObject(FB.child('users/'+uid));
			};
		}])

		// .filter('toUser',function(Users){
		// 	function uidToUser(uid){
		// 		if (uid in Users) {
		// 			var user = Users[uid];
		// 			return user.f + ' ' + user.l + ' (' + user.r + ')';
		// 		} else {
		// 			return '...';
		// 		}
		// 	}
		// 	uidToUser.$stateful = true;
		// 	return uidToUser;
		// })
	;
})();
