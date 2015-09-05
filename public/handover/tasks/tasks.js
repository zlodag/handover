(function(){
angular.module('handover.tasks',['ui.router','firebase'])
.factory('Tasks',function(FB,$firebaseArray,$firebaseObject){
	var ref = FB.child('tasks');
	return {
		current: $firebaseArray(ref.orderByChild("completed").equalTo(null)),
		recent: $firebaseArray(ref.orderByChild("inactive").limitToLast(3)),
		detail: function(taskId){return $firebaseObject(ref.child(taskId));},
		comments: function(taskId){return $firebaseArray(FB.child("comments/" + taskId));}
	};
})
.factory('Hospital',function(FB,$firebaseObject,$firebaseArray){
	return {
		wards: $firebaseObject(FB.child('wards')),
		specialties: $firebaseArray(FB.child('specialties'))
	};
})
.factory('Stamp',function(TIMESTAMP){
	return function(){
		this.at = TIMESTAMP
		this.by = 'Terrence Walburton';
		this.id = '0d2aa50f-e9d9-4adf-8988-36c3dd70aa2f';
	};
})
.config(function($stateProvider) {
	$stateProvider.state('tasks', {
		url: "/tasks",
		// abstract: true,
		templateUrl: '/handover/tasks/tasks.html',
		controller: function($scope,$state){
			$scope.go = $state.go;
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
			// console.log(tasks);
			$scope.tasks = tasks;
			$scope.context = 'Recent';
		}
	})
	.state('tasks.new',{
		url: '/new',
		templateUrl: '/handover/tasks/newTask.html',
		resolve: {
		    wards: function(Hospital){
		    	return Hospital.wards.$loaded();
		    },
		    specialties: function(Hospital){
		    	return Hospital.specialties.$loaded();
		    }
		},
		controller: function($scope,wards,specialties,Stamp,Tasks,$state){
			$scope.wards = wards;
			$scope.specialties = specialties;
			$scope.newTask = {
				"patient": "Hugo Weaving",
				"nhi": "LKJ1551",
				"ward": "M12",
				"bed": "16B",
				"specialty": "Obstetrics & Gynaecology",
				"text": "All of this was added subsequently",
				"urgency": 3
			};
			$scope.addTask = function(newTask){
				// var task = angular.copy(newTask);
				newTask.added = new Stamp();
				// var ref = FB.child("tasks").push();
				// ref.set(newTask, function(error) {
				// 	if (error){return console.error("There was a problem adding the task: ", error);}
				// 	console.log("Added task");
				// 	$state.go('tasks.detail',{taskId:ref.key()});
				// });
				Tasks.current.$add(newTask).then(function(ref) {
					var id = ref.key();
					console.log("added record with id " + id);
					$state.go('tasks.detail',{taskId:ref.key()});
				}).catch(function(error){
					console.error('Unable to add task: ', error);
				});
			};
		}
	})
	.state('tasks.detail',{
		url: '/:taskId',
		// template: 'My task: <pre ng-bind="task | json"></pre>',
		templateUrl: '/handover/tasks/taskDetail.html',
		resolve: {
		    task: function(Tasks,$stateParams){
		    	return Tasks.detail($stateParams.taskId).$loaded();
		    },
		    comments: function(Tasks,$stateParams){
		    	return Tasks.comments($stateParams.taskId).$loaded();
		    }
		},
		controller: function($scope,task,comments,Stamp){
			$scope.task = task;
			$scope.comments = comments;
			$scope.addComment = function(commentText){
				var comment = new Stamp();
				comment.text = commentText;
				comments.$add(comment);
			};
		}
	})
	;
})
;
})();
