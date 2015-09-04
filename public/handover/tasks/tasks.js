(function(){
angular.module('handover.tasks',['ui.router','firebase'])
.factory('Tasks',function(FB,$firebaseArray){
	var ref = FB.child('tasks');
	return {
		current: $firebaseArray(ref.orderByChild("completed").equalTo(null)),
		recent: $firebaseArray(ref.orderByChild("inactive").limitToLast(3))
	};
})
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		url: "/tasks",
		abstract: true,
		templateUrl: '/handover/tasks/overview.html',
		controller: function($scope){
			$scope.getStatus = function(task){
				return ('completed' in task) ?
				('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
				('accepted' in task ? 'Accepted' : 'Added');
			};
		}
	})
	.state('tasks.overview',{
		url: '/',
		views: {
			current: {
				templateUrl: '/handover/tasks/taskList.html',
				resolve: {
				    tasks: function(Tasks){
				    	return Tasks.current.$loaded();
				    }
				},
				controller: function($scope,tasks){
					$scope.tasks = tasks;
					$scope.context = 'Current';
				}
			},
			recent: {
				templateUrl: '/handover/tasks/taskList.html',
				resolve: {
				    tasks: function(Tasks){
				    	return Tasks.recent.$loaded();
				    }
				},
				controller: function($scope,tasks){
					$scope.tasks = tasks;
					$scope.context = 'Recent';
				}
			}
		}
	})
})
;
})();
