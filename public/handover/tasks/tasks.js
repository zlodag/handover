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
		.state('tasks.list',{
			url: '/{context:current|recent}',
			templateUrl: '/handover/tasks/taskList.html',
			resolve: {
				context: function($stateParams){
					return $stateParams.context;
				},
			    tasks: function(Tasks,context){
			    	return Tasks[context].$loaded();
			    }
			},
			controller: function($scope,tasks,context){
				$scope.tasks = tasks;
				$scope.context = context;
			}
		})
		.state('tasks.new',{
			url: '/new',
			templateUrl: '/handover/tasks/newTask.html',
			resolve: {
				authData: function(Auth){
					return Auth.$requireAuth();
				},
				waitForUser: function(authData,Me){
					return Me.ready;
				},
			    wards: function(Hospital){
			    	return Hospital.wards.$loaded();
			    },
			    specialties: function(Hospital){
			    	return Hospital.specialties.$loaded();
			    }
			},
			controller: function($scope,wards,specialties,Stamp,Tasks,$state){
				console.log('started task new controller');
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
					newTask.added = new Stamp();
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
			controller: function($scope,Stamp,task,comments,$q){
				$scope.task = task;
				$scope.canStamp = function(stamp){
					if (stamp === 'accepted') { return !task.accepted && !task.completed;}
					else if (stamp === 'completed' || stamp === 'cancelled') { return !task.completed;}
					else { return false; }
				};
				$scope.stamp = function(type, cancelled){
					var updateObject = {},
					stamp = new Stamp(),
					deferred = $q.defer();
					if (type === 'cancelled'){
						var reason = prompt('Reason for cancelling','');
						if (!reason) {
							deferred.reject('No reason for cancelling provided');
							return deferred.promise;
						}
						stamp.cancelled = reason;
						type = 'completed';
					}
					updateObject[type] = stamp;
					if (type === 'completed') { updateObject.inactive = stamp.at; }
					task.$ref().update(updateObject, function(error){
						if (error){deferred.reject("There was a problem updating the task: " + error);}
						else {deferred.resolve(updateObject);}
					});
					return deferred.promise;
				};
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
