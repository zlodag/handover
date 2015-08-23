(function(){
	angular.module('handover')
	.directive('handoverNavbar',function(){
		return {
			scope: true,
			controller: function($state,$scope,Auth){
				// this.path = $route.path;
				$scope.state = $state;
				$scope.logout = function(){
					Auth.$unauth();
				};
			},
			restrict: 'E',
			templateUrl: '/handover/navbar/navbar.html'
			//this could be a ng-include...
		};
	});
})();
