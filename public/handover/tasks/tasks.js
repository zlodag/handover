(function(){
angular.module('handover.tasks',['handover.data','ui.router','firebase'])
	.factory('Tasks',function(FB,$firebaseArray,$firebaseObject){
		var ref = FB.child('tasks');
		return {
			current: $firebaseArray(ref.orderByChild("completed").equalTo(null)),
			recent: $firebaseArray(ref.orderByChild("inactive").limitToLast(3)),
			detail: function(taskId){return $firebaseObject(ref.child(taskId));},
			comments: function(taskId){return $firebaseArray(FB.child("comments/" + taskId));},
			referrals: function(taskId){return $firebaseObject(FB.child("referrals/" + taskId));}
		};
	})
	.filter('toUser',function(){
		return function(uid, users){
			if (uid in users) {
				var user = users[uid];
				return user.f + ' ' + user.l + ' (' + user.r + ')';
			} else {
				return '...';
			}
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
			    comments: function(Tasks,taskId){
			    	return Tasks.comments(taskId).$loaded();
			    },
			    referrals: function(FB,taskId,Stamp2,$q,$timeout){
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
						var stamp = new Stamp2();
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
			controller: function($scope,Stamp,FB,taskId,task,comments,referrals,Users,$q){
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
				$scope.referrals = referrals;
				$scope.users = Users;
				$scope.target = 'e5e3580b-e2d1-47f3-80b6-4044a53622e0';
			}
		})
		;
	})
;
})();
