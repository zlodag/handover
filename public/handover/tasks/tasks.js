(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
			authData: function(Auth) {
				return Auth.$requireAuth();
		    },
		    tasks: function($firebaseArray,$window,authData){
				var ref = new $window.Firebase("https://nutm.firebaseio.com/tasks");
				return $firebaseArray(ref).$loaded();
			}
		},
		controller: function($scope,tasks,$rootScope,Auth){
			$scope.tasks = tasks;
			Auth.$onAuth(function(authData) {if (!authData){
				tasks.$destroy();
			}});
			// $rootScope.$on("logout", function() {
			// 	tasks.$destroy();
			// });
		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview.html'
	})
	.state('tasks.detail', {
		url: "/:taskId",
		templateUrl: '/handover/tasks/detail.html',
		resolve: {
			comments: function($firebaseArray,$window,$stateParams){
				var ref = new $window.Firebase("https://nutm.firebaseio.com/comments").child($stateParams.taskId);
				return $firebaseArray(ref).$loaded();
			},
			task: function($stateParams, tasks){
				return tasks.$getRecord($stateParams.taskId);
			}
		},
		controller: 'taskDetailController'
	});
})
.controller('taskDetailController', function(authData,$scope,comments,task,$window,Auth){
	$scope.task = task;
	$scope.comments = comments;
	Auth.$onAuth(function(authData) {if (!authData){
		comments.$destroy();
	}});
	// $rootScope.$on("logout", function() {
	// 	comments.$destroy();
	// });
	$scope.addComment = function(comment){
		comments.$add({
			user: authData.uid,
         	comment: comment,
         	timestamp: $window.Firebase.ServerValue.TIMESTAMP}
     	);
	};
})
;
})();
