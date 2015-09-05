(function(){
	angular.module('handover.data',['firebase'])
		.factory("FB",["$window", function($window){
			return new $window.Firebase("https://nutm.firebaseio.com");
		}])
		.factory("TIMESTAMP",["$window",function($window){
			return $window.Firebase.ServerValue.TIMESTAMP;
		}])
		.factory('Stamp',["TIMESTAMP",function(TIMESTAMP){
			return function(){
				this.at = TIMESTAMP
				this.by = 'Terrence Walburton';
				this.id = '0d2aa50f-e9d9-4adf-8988-36c3dd70aa2f';
			};
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
