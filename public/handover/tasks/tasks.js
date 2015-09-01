(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.factory('Tasks',function(FB,Profile){
	var tasks = {}, recent = {},
	ref = FB.child("tasks"),
	currentRef = ref.orderByChild("completed").equalTo(null),
	recentRef = ref.orderByChild("inactive").limitToLast(3);

	console.log('Setting up callbacks for current tasks');
	currentRef.on('child_added',snapToCurrent,errorHandler);
	currentRef.on('child_changed',snapToCurrent,errorHandler);
	currentRef.on('child_removed',function snapToCurrent (snap) {
		console.log('removed one task', snap.key());
		delete tasks[snap.key()];
	},errorHandler);
	Profile.addWatcher(currentRef);

	console.log('Setting up callbacks for recent tasks');
	recentRef.on('child_added',snapToRecent,errorHandler);
	recentRef.on('child_changed',snapToRecent,errorHandler);
	recentRef.on('child_removed',function snapToRecent (snap) {
		console.log('removed one task', snap.key());
		delete tasks[snap.key()];
	},errorHandler);
	Profile.addWatcher(recentRef);

	function errorHandler (error) {
		tasks = {};
		this.reject(error);
	}
	function snapToCurrent (snap) {
		console.log('updated or added one current task', snap.key());
		tasks[snap.key()] = snap.val();
	}
	function snapToRecent (snap) {
		console.log('updated or added one recent task', snap.key());
		recent[snap.key()] = snap.val();
	}
	return {
		get tasks(){return tasks;},
		get recent(){return recent;}
	};
})
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
		    ensureAuth: function(Profile){
		    	return Profile.ensureAuth();
		    }
		},
		controller: function($scope, Profile,Tasks){
			$scope.current = Tasks.current;
			$scope.recent = Tasks.recent;
			$scope.recent = {};
			$scope.getStatus = function(task){
				return ('completed' in task) ?
				('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
				('accepted' in task ? 'Accepted' : 'Added');
			};

		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview.html'
	})
	.state('tasks.new', {
		url: "/new",
		templateUrl: '/handover/tasks/newTask.html',
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
			console.log('starting details controller');
			$scope.taskId = taskId;
			$scope.users = users;

			$scope.comments = {};
			commentsRef.on('child_added',function(snap,prevKey){
				$scope.comments[snap.key()] = snap.val();
				$scope.$apply();
			});
			Profile.addWatcher(commentsRef);

			$scope.referrals = {};
			referralsRef.on('child_added',function(snap,prevKey){
				$scope.referrals[snap.key()] = snap.val();
				$scope.$apply();
			});
			Profile.addWatcher(referralsRef);

			$scope.canStamp = function(stamp, task){
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
