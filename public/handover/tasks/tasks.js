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
	$stateProvider.state('tasks', {
		url: "/tasks",
		// abstract: true,
		templateUrl: '/handover/tasks/tasks.html',
		controller: function($scope){
			$scope.getStatus = function(task){
				return ('completed' in task) ?
				('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
				('accepted' in task ? 'Accepted' : 'Added');
			};
		}
	})
	.state('tasks.current',{
		url: '/current',
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
	})
	.state('tasks.recent',{
		url: '/recent',
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
	})
	.state('tasks.new',{
		url: '/new',
		templateUrl: '/handover/tasks/newTask.html',
		// resolve: {
		//     tasks: function(Tasks){
		//     	return Tasks.recent.$loaded();
		//     }
		// },
		// controller: function($scope,tasks){
		// 	$scope.tasks = tasks;
		// 	$scope.context = 'Recent';
		// }
	})
	;
})
;
})();
