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
	;
})();
