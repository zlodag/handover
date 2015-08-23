(function(){
	angular.module('handover')
	.directive('handoverNavbar',function(){
		return {
			scope: true,
			controller: function($state,$scope,Auth,$rootScope){
				// this.path = $route.path;
				$scope.state = $state;
				$scope.logout = function(){
					// $rootScope.$broadcast('logout');
					Auth.$unauth();
				};
			},
			restrict: 'E',
			templateUrl: '/handover/addons/navbar.html'
			//this could be a ng-include...
		};
	});
})();
