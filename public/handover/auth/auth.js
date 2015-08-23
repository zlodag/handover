(function(){angular.module('handover.auth',['firebase'])
.factory("Auth", ["$firebaseAuth","$window", function($firebaseAuth,$window) {
	var ref = new $window.Firebase("https://nutm.firebaseio.com");
	return $firebaseAuth(ref);
}]);
})();
