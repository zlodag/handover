(function(){
angular.module('handover.tasks',['handover.data','ui.router','firebase'])
	.factory('TaskList', function($firebaseArray,$state){
		return $firebaseArray.$extend({
			goTo: function(taskId){$state.go('tasks.detail',{taskId:taskId});},
			getStatus : function(taskId){
				var task = this.$getRecord(taskId);
				return ('completed' in task) ?
				('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
				('accepted' in task ? 'Accepted' : 'Added');
			}
			// $$added: function(snap, prevChild) {
			// 	var item = $firebaseArray.prototype.$$added.apply(this, arguments);
			// 	return $q.all([
	  //           	$firebaseObject(FB.child('tasks/' + item.$id)).$loaded(),
	  //           	$firebaseObject(FB.child('referrals/' + item.$value)).$loaded()
   //          	]).then(function(promises){
			// 		item.task = promises[0];
			// 		item.referral = promises[1];
			// 		console.log(item);
   //          		return item;
   //          	});
			// },
		});
	})
	.factory('Events', function(FB,$firebaseArray,Stamp){
		return function(taskId){
			return $firebaseArray.$extend({
				addComment: function(comment){
					var stamp = new Stamp(taskId);
					stamp.comment = comment;
					this.$add(stamp);
				},
				referTo: function(uid){
					var stamp = new Stamp(taskId);
					stamp.referral = uid;
					this.$add(stamp);
				},
				updateStatus: function(status){
					var stamp = new Stamp(taskId);
					stamp.status = status;
					if (status === 'Cancelled'){stamp.comment = prompt('Reason for cancelling','');}
					this.$add(stamp);
				}
			})(FB.child("events").orderByChild("task").equalTo(taskId));
		};
	})
	.factory('Tasks',function(FB,$firebaseArray,$firebaseObject,TaskList){
		var ref = FB.child('tasks');
		return {
			current: TaskList(ref.orderByChild("completed").equalTo(null)),
			recent: TaskList(ref.orderByChild("inactive").limitToLast(10)),
			detail: function(taskId){return $firebaseObject(ref.child(taskId));},
			referrals: function(taskId){return $firebaseObject(FB.child("referrals/" + taskId));}
		};
	})
	.directive('taskDisplay',function(Tasks){
		return {
			restrict: 'E',
			templateUrl: '/handover/tasks/taskDisplay.html',
			scope: {},
			controller: function($scope,Tasks,$attrs){
				$scope.tasks = Tasks[$attrs.context];
			}
		};
	})
	.directive('events',function(Events){
		return {
			restrict: 'E',
			templateUrl: '/handover/tasks/events.html',
			scope: {
				task: '='
			},
			controller: function($scope,Tasks,Users){
				$scope.events = Events($scope.task.$id);
				$scope.users = Users;
			}
		};
	})
	.filter('toUser',function(Users){
		function uidToUser(uid){
			if (uid in Users) {
				var user = Users[uid];
				return user.f + ' ' + user.l + ' (' + user.r + ')';
			} else {
				return '...';
			}
		}
		uidToUser.$stateful = true;
		return uidToUser;
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
			template: function(params){
					return '<task-display context="' + params.context + '"></task-display>';
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
			    wardlist: function(wards, $q){
			    	var deferred = $q.defer();
					wards.$ref().once("value",function(list){
						deferred.resolve(Object.keys(list.val()));
					});
			    	return deferred.promise;
				},
			    specialties: function(Hospital){
			    	return Hospital.specialties.$loaded();
			    }
			},
			controller: function($scope,wards,wardlist,specialties,Stamp,Tasks,$state){
				console.log('started task new controller');
				var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', numbers = '1234567890';
				var randomize = function(){
					$scope.newTask = {
						"patient": chance.name(),
						"nhi": chance.string({length: 3, pool: letters}) + chance.string({length: 4, pool: numbers}),
						"ward": chance.pick(wardlist),
						"bed": chance.natural({min: 1, max: 16}).toString() + chance.character({pool: 'ABCDEF'}),
						// "specialty": "Obstetrics & Gynaecology",
						"specialty": chance.pick(specialties).$id,
						"text": chance.sentence(),
						"urgency": chance.natural({min: 1, max: 3})
					};
				}
				$scope.randomize = randomize;
				randomize();
				$scope.wards = wards;
				$scope.specialties = specialties;
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
				taskId: function($stateParams){
					return $stateParams.taskId;
				},
			    task: function(Tasks,taskId){
			    	return Tasks.detail(taskId).$loaded();
			    },
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
			},
			controller: function($scope,Stamp,FB,taskId,task,referrals,Users,$q){
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
				// $scope.addComment = function(commentText){
				// 	var comment = new Stamp();
				// 	comment.text = commentText;
				// 	comments.$add(comment);
				// };
				$scope.referrals = referrals;
				$scope.users = Users;
				$scope.target = 'e5e3580b-e2d1-47f3-80b6-4044a53622e0';
			}
		})
		;
	})
;
})();
