(function(){
	var app = angular.module('handover',[
	 	'ngAnimate',
	 	'ui.router',
	 	'handover.tasks'
	]);
	app.config(["$urlRouterProvider", "$locationProvider", function($urlRouterProvider, $locationProvider) {
		$urlRouterProvider.otherwise("/tasks/");
		$locationProvider.html5Mode(true);
	}]);
	app.factory("FB",["$window", function($window){
		return new $window.Firebase("https://nutm.firebaseio.com");
	}]);
	app.factory("TIMESTAMP",["$window",function($window){
		return $window.Firebase.ServerValue.TIMESTAMP;
	}]);
})();
