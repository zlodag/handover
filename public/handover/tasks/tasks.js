(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
		    ensureAuth: function(Profile){
		    	return Profile.ensureAuth();
		    },
		    tasksRef: function(FB,ensureAuth){
				return FB.child("tasks");
			},
			currentTasksRef: function(tasksRef){
				return tasksRef.orderByChild("completed").equalTo(null);
			},
			recentTasksRef: function(tasksRef){
				return tasksRef.orderByChild("inactive").limitToLast(3);
			}
		},
		controller: function(currentTasksRef, recentTasksRef,Profile){
			$scope.tasks = {};
			currentTasksRef.on('child_added',function(snap,prevKey){
				$scope.tasks[snap.key()] = snap.val();
				$scope.apply();
			});
			currentTasksRef.on('child_changed',function(snap,prevKey){
				$scope.tasks[snap.key()] = snap.val();
				$scope.apply();
			})
			Profile.addWatcher(currentTasksRef);

			$scope.recent = {};
			recentTasksRef.on('child_added',function(snap,prevKey){
				$scope.recent[snap.key()] = snap.val();
				$scope.apply();
			});
			recentTasksRef.on('child_changed',function(snap,prevKey){
				$scope.recent[snap.key()] = snap.val();
				$scope.apply();
			})
			Profile.addWatcher(recentTasksRef);

			$scope.getStatus = function(task){
				return ('completed' in task) ?
				('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
				('accepted' in task ? 'Accepted' : 'Added');
			};

		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview_alt.html'
	})
	.state('tasks.new', {
		url: "/new",
		templateUrl: '/handover/tasks/newTask.html',
		// template: "<p>New task</p>",
		resolve: {
		    specialties: function(FB,ensureAuth,$q){
		    	var deferred = $q.defer();
				FB.child("specialties").once('value',function(snap){
					deferred.resolve(snap.val());
				}, function(error){
					deferred.reject(error);
				});
				return deferred.promise;
			},
		    wards: function(FB,ensureAuth,$q){
		    	var deferred = $q.defer();
				FB.child("wards").once('value',function(snap){
					deferred.resolve(snap.val());
				}, function(error){
					deferred.reject(error);
				});
				return deferred.promise;
			},
		},
		controller: function($scope,$state,specialties,wards,tasksRef,Stamp){
			$scope.specialties = specialties;
			$scope.wards = wards;
			$scope.newTask = {
				"patient": "Humphrey Herbert",
				"nhi": "LKJ1551",
				"ward": "M12",
				"bed": "5A",
				"specialty": "Obstetrics & Gynaecology",
				"text": "He is the wrong specimen for this ward!",
				"urgency": 2
			};
			$scope.addTask = function(newTask){
				var task = angular.copy(newTask);
				task.added = Stamp();
				console.log(task);
				var ref = tasksRef.push();
				ref.set(task, function(error) {
					if (error){return console.error("There was a problem adding the task: ", error);}
					console.log("Added task");
					$state.go('tasks.detail',{taskId:ref.key()});
				});
			};
		}
	})
	.state('tasks.detail', {
		url: "/:taskId",
		templateUrl: '/handover/tasks/detail.html',
		resolve: {
			taskId: function($stateParams){
				return $stateParams.taskId;
			},
			commentsRef: function(FB,ensureAuth,taskId){
				return FB.child("comments").child(taskId);
			},
			referralsRef: function(FB,ensureAuth,taskId){
				return FB.child("referrals").child(taskId);
			},
			taskboardRef: function(FB,ensureAuth){
				return FB.child("taskboard");
			},
			taskRef: function(tasksRef,taskId){
				return tasksRef.child(taskId);
			},
		    users: function(FB,ensureAuth,$q){
		    	var deferred = $q.defer();
				FB.child("users").once('value',function(snap){
					deferred.resolve(snap.val());
				}, function(error){
					deferred.reject(error);
				});
				return deferred.promise;
			},

		},
		controller: function($scope, users, taskId, commentsRef, referralsRef, taskboardRef, taskRef, Stamp, TIMESTAMP,Profile){
			// console.log('starting details controller');
			$scope.task = $scope.tasks[taskId];
			$scope.users = users;

			$scope.comments = {};
			commentsRef.on('child_added',function(snap,prevKey){
				$scope.comments[snap.key()] = snap.val();
				$scope.apply();
			});
			Profile.addWatcher(commentsRef);

			$scope.referrals = {};
			referralsRef.on('child_added',function(snap,prevKey){
				$scope.referrals[snap.key()] = snap.val();
				$scope.apply();
			});
			Profile.addWatcher(referralsRef);

			$scope.canStamp = function(stamp){
				if (stamp === 'accepted') { return !task.accepted && !task.completed;}
				else if (stamp === 'completed' || stamp === 'cancelled') { return !task.completed;}
				else { return false; }
			};
			$scope.stamp = function(stamp, cancelled){
				var updateObject = {};
				updateObject[stamp] = Stamp();
				if (stamp === 'completed'){
					if (cancelled) {updateObject.completed.cancelled = cancelled;}
					updateObject.inactive = TIMESTAMP;
				}
				console.log(updateObject);
				taskRef.update(updateObject, function(error){
					if (error){return console.error("There was a problem updating the task: ", error);}
					console.log('Updated task');
				});
			};
			$scope.addComment = function(commentText){
				var comment = Stamp();
				comment.text = commentText;
				comments.$add(comment);
			};
			$scope.disabled = function(key){
				 return (referrals.$indexFor(key) !== -1 || key === Profile.auth.uid);
			};
			$scope.refer = function(target){
				var userId = target.id,
				userName = target.name,
				ref = referralsRef.child(userId),
				stamp = Stamp();
				stamp.to = userName;
				ref.set(stamp,function(error){
					if (error){return console.error("There was a problem referring the task: ", error);}
					console.log("Task referred");
					ref.child('at').once("value", function(snap){
						 taskboardRef.child(userId).child(taskId).set(snap.val(),function(error){
			 				if (error){return console.error("There was a problem posting the task to the user's taskboard: ", error);}
							console.log("Task posted to user's taskboard");
						 });
					});
				});
			};
		}
	})
	;
})
;
})();
