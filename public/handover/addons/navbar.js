(function(){
	angular.module('handover')
	.directive('handoverNavbar',function(){
		return {
			// scope: true,
			// controller: function($state,$scope){
			// 	$scope.state = $state;
			// },
			restrict: 'E',
			templateUrl: '/handover/addons/navbar.html'
			//this could be a ng-include...
		};
	});
})();
