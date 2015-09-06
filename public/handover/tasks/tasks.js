(function(){
angular.module('handover.tasks',['handover.data','ui.router','firebase'])
	.factory('Tasks',function(FB,$firebaseArray,$firebaseObject){
		var ref = FB.child('tasks');
		return {
			current: $firebaseArray(ref.orderByChild("completed").equalTo(null)),
			recent: $firebaseArray(ref.orderByChild("inactive").limitToLast(3)),
			detail: function(taskId){return $firebaseObject(ref.child(taskId));},
			comments: function(taskId){return $firebaseArray(FB.child("comments/" + taskId));}
		};
	})
	.config(function($stateProvider) {
		$stateProvider.state('tasks', {
			url: "/tasks",
			abstract: true,
			template: '<ui-view></ui-view>',
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
			controller: function($scope,wards,specialties,Profile,Tasks,$state){
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
					newTask.added = new Profile.stamp();
					Tasks.current.$add(newTask).then(function(ref) {
						var id = ref.key();
						console.log("added record with id " + id);
						$state.go('tasks.detail',{taskId:ref.key()});
					}).catch(function(error){
						console.error('Unable to add task: ',newTask, error);
					});
				};
			}
		})
		.state('tasks.detail',{
			url: '/:taskId',
			templateUrl: '/handover/tasks/taskDetail.html',
			resolve: {
			    task: function(Tasks,$stateParams){
			    	return Tasks.detail($stateParams.taskId).$loaded();
			    },
			    comments: function(Tasks,$stateParams){
			    	return Tasks.comments($stateParams.taskId).$loaded();
			    }
			},
			controller: function($scope,task,comments,Profile){
				$scope.task = task;
				$scope.canStamp = function(stamp){
					if (stamp === 'accepted') { return !task.accepted && !task.completed;}
					else if (stamp === 'completed' || stamp === 'cancelled') { return !task.completed;}
					else { return false; }
				};
				$scope.stamp = function(stamp, cancelled){
					var updateObject = {};
					updateObject[stamp] = new Profile.stamp();
					if (stamp === 'completed'){
						if (cancelled) {updateObject.completed.cancelled = prompt('Reason for cancelling','');}
						updateObject.inactive = updateObject.completed.at;
					}
					task.$ref().update(updateObject, function(error){
						if (error){return console.error("There was a problem updating the task: ", updateObject, error);}
						console.log('Updated task');
					});
				};
				$scope.comments = comments;
				$scope.addComment = function(commentText){
					var comment = new Profile.stamp();
					comment.text = commentText;
					comments.$add(comment);
				};
			}
		})
		;
	})
;
})();
