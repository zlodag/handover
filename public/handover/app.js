(function(){
	angular.module('handover',[
	 	'ngAnimate',
	 	'ui.router',
	 	'handover.auth',
	 	'handover.tasks'
	])
	.config(["$urlRouterProvider", "$locationProvider", function($urlRouterProvider, $locationProvider) {
		$urlRouterProvider.otherwise("/tasks/new");
		$locationProvider.html5Mode(true);
	}])
	.directive('handoverNavbar',function(){
		return {
			restrict: 'E',
			scope: {},
			templateUrl: '/handover/navbar.html',
			controller: function($scope,Profile){
				$scope.loggedIn = function(){
					return !!Profile.info;
				};
			}
		};
	})
	;
})();
