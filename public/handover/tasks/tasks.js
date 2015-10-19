(function(){
// var TaskListItem = function(){
// 	// this.name = "I'm base class";
// 	this.data = {};
// 	// console.log('Adding a new tasklist item');
// 	this.getRealStatus = function(){
// 		return 'Completed' in this.data ? 'Completed' :
// 		('Accepted' in this.data ? 'Accepted' : 'Added');
// 	};
// }
// TaskListItem.prototype.getStatus = function(){
// 	return 'Completed' in this.data ? 'Completed' :
// 	('Accepted' in this.data ? 'Accepted' : 'Added');
// };
// var childClass = function(){
// 	console.log('You made a baby');
// 	this.data = {Completed: true};
// };
// childClass.prototype = new TaskListItem();
// childClass.prototype.constructor = childClass;

// var test1 = new TaskListItem();
// console.log('Parent:', test1.getStatus(), test1.getRealStatus());
// var test2 = new childClass();
// console.log('Child:', test2.getStatus(), test2.getRealStatus());


angular.module('handover.tasks',['handover.data','ui.router','firebase'])
	.factory('EventsFactory', function($firebaseArray,Stamp,FB,$q){
		return function(taskId){
			return $firebaseArray(FB.child("events").orderByChild("task").equalTo(taskId));
		};
	})
	.service('TaskListItem',function($state){
		return function(){
			this.getStatus = function(){
				return 'Completed' in this ? 'Completed' :
				('Accepted' in this ? 'Accepted' : 'Added');
			};
			this.goToDetail = function(){
				$state.go('tasks.detail',{taskId:this.$id});
			};
		};
	})
	.factory('FullSnapToTaskListItem',function(TaskListItem){
		var TLI = function(snap){
			this.$id = snap.key();
			angular.extend(this,snap.val());
		};
		TLI.prototype = new TaskListItem();
		TLI.prototype.constructor = TLI;
		return TLI;
	})
	.factory('TaskDetailFactory',function($firebaseObject,EventsFactory,FB,Stamp,FullSnapToTaskListItem){
		return function(taskId){
			function addComment(comment){
				var stamp = new Stamp(this.$id);
				stamp.comment = comment;
				this.events.$add(stamp);
			}
			return $firebaseObject.$extend({
				events: EventsFactory(taskId),
				addComment: addComment,
				$$updated: function(snap){
					angular.extend(this, snap.val());
					this.data = new FullSnapToTaskListItem(snap);
					return true;
				},
				_newStatusEvent: function(status){
					var stamp = new Stamp(this.$id);
					stamp.status = status;
					if (status === 'Cancelled'){stamp.comment = prompt('Reason for cancelling','');}
					return this.events.$add(stamp);
				},
				newStatus: function(status){
					if (status === 'Accepted') {
						var taskRef = this.$ref();
						this._newStatusEvent(status).then(function(eventRef){
							console.log('Added eventRef:', eventRef);
							taskRef.child('Accepted').set(eventRef.key());
						}).catch(console.error);
					}
				}
				/*
				referTo: function(uid){
					var stamp = new Stamp(this.$id);
					stamp.referral = uid;
					this.events.$add(stamp);
				}
				*/
			})(FB.child('tasks/' + taskId))
		};
	})
	.factory('TaskListFactory',function($firebaseArray,FullSnapToTaskListItem){
		return function(ref){
			console.log('Making a list with ref: ' +  ref.toString());
			return $firebaseArray.$extend({
				// printMe: function(){
				// 	console.log('This list is ' + this.$list.length + ' items long...');
				// },
				$$added: function(snap){
					return new FullSnapToTaskListItem(snap);
				}
			})(ref);
		};
	})
	.factory('TaskLists',function(FB,TaskListFactory){
		var ref = FB.child('tasks');
		return {
			current: TaskListFactory(ref.orderByChild("Completed").equalTo(null).limitToLast(3)),
			recent: TaskListFactory(ref.orderByChild("Completed").startAt(true).limitToLast(10)),
		};
	})
	.config(function($stateProvider) {
		$stateProvider.state('tasks', {
			url: "/tasks",
			abstract: true,
			template: '<ui-view></ui-view>'
		})
		.state('tasks.list',{
			url: '/{context:current|recent}',
			templateUrl: '/handover/tasks/taskList.html',
			resolve: {
				context: function($stateParams){
					return $stateParams.context;
				},
				tasks: function(TaskLists,context){
					return TaskLists[context].$loaded();
				}
			},
			controller: function($scope,context,tasks){
				$scope.context = context
				$scope.tasks = tasks;
			}
		})
		.state('tasks.detail',{
			url: '/:taskId',
			templateUrl: '/handover/tasks/taskDetail.html',
			resolve: {
			    task: function(TaskDetailFactory,$stateParams){
			    	return TaskDetailFactory($stateParams.taskId).$loaded();
			    }
			},
			controller: function($scope,task){
				// console.log(task.events);
				$scope.task = task;
			}
		})
	})
;
})();
	// .directive('events',function(EventsFactory){
	// 	return {
	// 		restrict: 'E',
	// 		templateUrl: '/handover/tasks/events.html',
	// 		scope: false
	// 	};
	// })
	// .filter('toUser',function(Users){
	// 	function uidToUser(uid){
	// 		if (uid in Users) {
	// 			var user = Users[uid];
	// 			return user.f + ' ' + user.l + ' (' + user.r + ')';
	// 		} else {
	// 			return '...';
	// 		}
	// 	}
	// 	uidToUser.$stateful = true;
	// 	return uidToUser;
	// })

			// .factory("Task", function(EventsFactory,$state) {
	// 	function Task(snap){
	// 		this.data = snap.val();
	// 		this.$id = snap.key();
	// 		this.events = EventsFactory(this.$id);
	// 		this.newStatus = function(status){
	// 			var stamp = new Stamp(this.$id);
	// 			stamp.status = status;
	// 			if (status === 'Cancelled'){stamp.comment = prompt('Reason for cancelling','');}
	// 			return this.events.$add(stamp).then(function(item1, item2){
	// 				console.log('the item returned is', item1, item2);
	// 			});
	// 		}
	// 	}
	// 	Task.prototype = {
	// 		update: function(snap) {
	// 			// store a string into this.message (instead of the default $value)
	// 			if( (snap.val().Accepted !== this.data.Accepted) || (snap.val().Completed !== this.data.Completed) ) {
	// 				this.data = snap.val();
	// 				return true;
	// 			}
	// 			return false;
	// 		},
	// 		getStatus : function(){
	// 			// var task = this.$getRecord(taskId);
	// 			return ('Completed' in this.data) ? 'Completed' :
	// 			('Accepted' in this.data ? 'Accepted' : 'Added');
	// 		},
	// 		goToDetail: function(){
	// 			$state.go('tasks.detail',{taskId:this.$id});
	// 		}

	// 		// 		var id = ref.key();
	// 		// 		var deferred = $q.defer();
	// 		// 		console.log('Added event: ' + stamp);
	// 		// 		FB.child('tasks/' + )
	// 		// 		var stamp = new Stamp(id);
	// 		// 		stamp.status = 'Added';
	// 		// 		FB.child("events").push(stamp,function(error){
	// 		// 			if (error){
	// 		// 				console.error(error);
	// 		// 				deferred.reject(error);
	// 		// 			} else {
	// 		// 				console.log('Added event: ', stamp);
	// 		// 				deferred.resolve(error);
	// 		// 			}
	// 		// 		});
	// 		// 		return deferred;
	// 		// 	}).catch(function(error){
	// 		// 		console.error('Unable to add task: ',task, error);
	// 		// 	});
	// 		// }
	// 	};
	// 	return Task;
	// })
	// .factory('TaskListFactory', function($firebaseArray,$q,Task,Stamp,FB,$state){
	// 	return $firebaseArray.$extend({
	// 		$$added: function(snap) {
	// 			var task = new Task(snap);
	// 			return task.events.$loaded().then(function(){
	// 				return task;
	// 			});
	// 	    },
	// 		$$updated: function(snap) {
	// 			var task = this.$getRecord(snap.key());
	// 			return task.update(snap);
	// 		},
	// 		newTask: function(task){
	// 			//newTask.added = new Stamp();
	// 			this.$add(task).then(function(ref) {
	// 				var deferred = $q.defer();
	// 				var id = ref.key();
	// 				console.log('Added task. ID: ' + id);
	// 				var stamp = new Stamp(id);
	// 				stamp.status = 'Added';
	// 				FB.child("events").push(stamp,function(error){
	// 					if (error){
	// 						console.error(error);
	// 						deferred.reject(error);
	// 					} else {
	// 						console.log('Added event: ', stamp);
	// 						deferred.resolve();
	// 						$state.go('tasks.detail',{taskId:id});
	// 					}
	// 				});
	// 				return deferred;
	// 			}).catch(function(error){
	// 				console.error('Unable to add task: ',task, error);
	// 			});
	// 		}
	// 	});
	// })
	// .factory('IndexTaskList',function(TaskListFactory,Task,FB,$q){
	// 	return TaskListFactory.$extend({
	// 		$$added: function(snap) {
	// 			var taskId = snap.key();
	// 			var referrer = snap.val();
	// 			var deferred = $q.defer();
	// 			FB.child('tasks/' + taskId).once("value",deferred.resolve,deferred.reject);
	// 			return deferred.then(function(snap){
	// 				var task = new Task(snap);
	// 				return task.events.$loaded().then(function(){
	// 					return task;
	// 				});
	// 			}, function(error){
	// 				console.error(error);
	// 			});
	// 	    }
	// 	});
	// })
	// .factory('TaskBoard',function(IndexTaskList,FB){
	// 	return function(uid){
	// 		return IndexTaskList(FB.child('taskboard/'+uid));
	// 	};
	// })// .state('tasks.new',{
		// 	url: '/new',
		// 	templateUrl: '/handover/tasks/newTask.html',
		// 	resolve: {
		// 		authData: function(Auth){
		// 			return Auth.$requireAuth();
		// 		},
		// 		waitForUser: function(authData,Me){
		// 			return Me.ready;
		// 		},
		// 	    wards: function(Hospital){
		// 	    	return Hospital.wards.$loaded();
		// 	    },
		// 	    wardlist: function(wards, $q){
		// 	    	var deferred = $q.defer();
		// 			wards.$ref().once("value",function(list){
		// 				deferred.resolve(Object.keys(list.val()));
		// 			});
		// 	    	return deferred.promise;
		// 		},
		// 	    specialties: function(Hospital){
		// 	    	return Hospital.specialties.$loaded();
		// 	    }
		// 	},
		// 	controller: function($scope,wards,wardlist,specialties,Stamp,Tasks,$state){
		// 		// console.log('started task new controller');
		// 		var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', numbers = '1234567890';
		// 		var randomize = function(){
		// 			$scope.newTask = {
		// 				"patient": chance.name(),
		// 				"nhi": chance.string({length: 3, pool: letters}) + chance.string({length: 4, pool: numbers}),
		// 				"ward": chance.pick(wardlist),
		// 				"bed": chance.natural({min: 1, max: 16}).toString() + chance.character({pool: 'ABCDEF'}),
		// 				// "specialty": "Obstetrics & Gynaecology",
		// 				"specialty": chance.pick(specialties).$id,
		// 				"text": chance.sentence(),
		// 				"urgency": chance.natural({min: 1, max: 3})
		// 			};
		// 		}
		// 		$scope.randomize = randomize;
		// 		randomize();
		// 		$scope.wards = wards;
		// 		$scope.specialties = specialties;
		// 		$scope.addTask = function(newTask){
		// 			return Tasks.current.newTask(newTask);
		// 		};
		// 		// 	//newTask.added = new Stamp();
		// 		// 	console.log(newTask);
		// 		// 	Tasks.current.$add(newTask).then(function(ref) {
		// 		// 		var id = ref.key();
		// 		// 		console.log("added record with id " + id);
		// 		// 		$state.go('tasks.detail',{taskId:ref.key()});
		// 		// 	}).catch(function(error){
		// 		// 		console.error('Unable to add task: ',newTask, error);
		// 		// 	});
		// 		// };
		// 	}
		// })

    /*
			    referrals: function(FB,taskId,Stamp,$q,$timeout){
			    	var query = FB.child("referrals").orderByChild('task').equalTo(taskId);
			    	var refer = function(target){
			    		function referralHandler(callback){
			    			return function(error) {
								if (error){
									console.error("Referral failed", stamp);
									deferred.reject(stamp);
								} else {callback();}
							};
			    		}
			    		var deferred = $q.defer();
						var stamp = new Stamp();
						stamp.to = target;
						stamp.task = taskId;
						var ref = query.ref().push();
						ref.set(stamp,referralHandler(function(){
								FB.child("taskboard/" + target + "/" + taskId).set(ref.key(), referralHandler(function() {
								console.log("Referred successfully", stamp);
								deferred.resolve(stamp);
							}));
						}));
						return deferred.promise;
					};
			    	var referrals = {};
			    	query.on("child_added", function(snap){
			    		$timeout(function(){
				    		referrals[snap.key()] = snap.val();
		    			},0);
			    	});
			    	query.on("child_changed", function(snap){
			    		$timeout(function(){
				    		referrals[snap.key()].cancelled = snap.val().cancelled;
		    			},0);
			    	});
			    	query.on("child_removed", function(snap){
			    		$timeout(function(){
			    			delete referrals[snap.key()];
		    			},0);
			    	});
			    	return {
			    		// ref: ref,
			    		refer: refer,
			    		get referrals(){return referrals;}
			    	};
			    }
			    // referrals: function(Tasks,taskId){
			    // 	return Tasks.referrals(taskId).$loaded();
			    // },
			    // users: function(FB,$q){
			    // 	var deferred = $q.defer();
			    // 	FB.child('users/index').once("value",function(snap){
		    	// 		deferred.resolve(snap.val());
			    // 	});
			    // 	return deferred.promise;
			    // }
			controller: function($scope,Stamp,FB,taskId,task,referrals,Users,$q){
				//$scope.task = task;
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
				// $scope.addComment = function(commentText){
				// 	var comment = new Stamp();
				// 	comment.text = commentText;
				// 	comments.$add(comment);
				// };
				$scope.referrals = referrals;
				$scope.users = Users;
				$scope.target = 'e5e3580b-e2d1-47f3-80b6-4044a53622e0';
			}
			*/
