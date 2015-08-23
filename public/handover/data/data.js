(function(){angular.module('handover.data',['firebase'])
.factory("Auth", function($firebaseAuth,$window) {
	var ref = new $window.Firebase("https://nutm.firebaseio.com");
	return $firebaseAuth(ref);
})
.factory('specialtyArray',function($firebaseArray,$window) {
	var ref = new $window.Firebase("https://nutm.firebaseio.com/specialties");
	return $firebaseArray(ref);
})
.run(function($rootScope, $state, Auth) {
	Auth.$onAuth(function(authData) {
		$rootScope.auth = authData;
	});
})
;
})();
