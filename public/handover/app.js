(function(){
	angular.module('handover',[
	 	// 'ngAnimate',
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
			scope: false,
			templateUrl: '/handover/navbar.html',
			controller: function($scope){
				$scope.printMe = function(){
					console.log($scope);
				};
			}
		};
	})
	.directive('handoverAlerts',function(){
		return {
			restrict: 'E',
			scope: {},
			templateUrl: '/handover/alerts.html',
			controller: function($scope,Alerts){
				$scope.alerts = Alerts;
			}
		};
	})
	.directive('emptyToNull', function () {
	    return {
	        restrict: 'A',
	        require: 'ngModel',
	        link: function (scope, elem, attrs, ctrl) {
	            ctrl.$parsers.push(function(viewValue) {
	                if(viewValue === "") {
	                    return null;
	                }
	                return viewValue;
	            });
	        }
	    };
	})
	.factory('Alerts',function(){
		var list = [];
		// list = [{
		// 		str: 'Something boring',
		// 		at: Date.now(),
		// 		error: false
		// 	},
		// 	{
		// 		str: 'Something exciting',
		// 		at: Date.now(),
		// 		error: true
		// 	},{
		// 		str: 'Something boring',
		// 		at: Date.now(),
		// 		error: false
		// 	},{
		// 		str: "We have a problem",
		// 		at: Date.now(),
		// 		error: true
		// 	}];
		function add(str, error){
			list.push({
				str: str,
				at: Date.now(),
				error: !!error
			});
			if (error) console.log(str);
		}
		function remove(index){
			list.splice(index, 1);
		}
		function reset(){
			list.length = 0;
		}
		return {
			list : list,
			add : add,
			remove : remove,
			reset: reset
		};
	})
	.run(function($rootScope,$state,Alerts,Users,Auth){
		$rootScope.users = Users;
		Auth.$onAuth(function (authData){
			if (!authData) {
				// console.log('AuthData absent', authData);
				delete $rootScope.authData;
				// Me.del();
			} else {
				// console.log('AuthData present', authData);
				$rootScope.authData = authData;
				// Me.set(authData.uid).catch(console.error);
			}
		});
		$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams) {
			Alerts.reset();
		});
		$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
			if (error === 'AUTH_REQUIRED') {
				Alerts.add('Authentication required, redirecting to login page', true);
				$state.go('login');
			} else {
				console.log(event, toState, toParams, fromState, fromParams, error);
				Alerts.add(error);
			}
		});
	})
	;
})();
