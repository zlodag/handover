(function(){angular.module('handover.tasks',['ui.router','firebase','handover.auth'])
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
		    tasks: function(TaskArray){
		    	return TaskArray.$loaded();
		    }
		},
		controller: function($scope,tasks){
			$scope.tasks = tasks;
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
.factory('TaskArray',function($firebaseArray,$window){
	var ref = new $window.Firebase("https://nutm.firebaseio.com/tasks");
	return $firebaseArray(ref);
})
.controller('taskDetailController', function(authData,$scope,comments,task,$window){
	// console.log(authData,$scope,comments,task);
	$scope.task = task;
	$scope.comments = comments;
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
