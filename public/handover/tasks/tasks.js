(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
			// authData: function(Auth) {
			// 	// console.log('waiting 0');
			// 	return Auth.$requireAuth();
		 //    },
		    tasksRef: function(FB){
				console.log('waiting 1');
				return FB.child("tasks");
			}
		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview_alt.html',
		resolve: {
			tasks: function($firebaseArray,tasksRef){
				// console.log('waiting 2');
				var ref = tasksRef.orderByChild("completed").equalTo(null);
				return $firebaseArray(ref).$loaded();
			},
			recent: function($firebaseArray,tasksRef){
				// console.log('waiting 2.5');
				var ref = tasksRef.orderByChild("inactive").limitToLast(3);
				return $firebaseArray(ref).$loaded();
			}
		},
		controller: 'overviewController'
	})
	.state('tasks.new', {
		url: "/new",
		templateUrl: '/handover/tasks/newTask.html',
		// template: "<p>New task</p>",
		resolve: {
			specialties: function(specialtyArray){
				// console.log('waiting 3');
		    	return specialtyArray.$loaded();
		    },
		    wards: function(wardArray){
				// console.log('waiting 4');
  		    	return wardArray.$loaded();
		    }
		},
		controller: 'newTaskController'
	})
	.state('tasks.detail', {
		url: "/:taskId",
		templateUrl: '/handover/tasks/detail.html',
		resolve: {
			taskId: function($stateParams){
				return $stateParams.taskId;
			},
			comments: function(FB,$firebaseArray,taskId){
				console.log('waiting 5');
				var ref = FB.child("comments").child(taskId);
				return $firebaseArray(ref).$loaded();
			},
			referrals: function(FB,$firebaseArray,taskId){
				// console.log('waiting 6');
				var ref = FB.child("referrals").child(taskId);
				return $firebaseArray(ref).$loaded();
			},
			task: function(tasksRef,$firebaseObject,taskId){
				console.log('waiting 6');
				var ref = tasksRef.child(taskId);
				return $firebaseObject(ref).$loaded();
			},
		},
		controller: 'taskDetailController'
	})
	;
})
.controller('overviewController',function($scope,tasks,recent
            // ,Auth
            ){
	$scope.tasks = tasks;
	$scope.recent = recent;
	// Auth.$onAuth(function(authData) {if (!authData){
	// 	tasks.$destroy();
	// 	recent.$destroy();
	// }});
	$scope.getStatus = function(task){
		return ('completed' in task) ?
			('cancelled' in task.completed ? 'Cancelled' : 'Completed') :
			('accepted' in task ? 'Accepted' : 'Added');
	};
})
.controller('newTaskController', function($scope,$state,specialties,wards,tasksRef,Stamp){
	$scope.specialties = specialties;
	$scope.wards = wards;
	$scope.newTask = {
		"patient": "Humphrey Herbert",
		"nhi": "LKJ1551",
		"ward": "M12",
		"bed": "5A",
		"specialty": "Obstetrics & Gynaecology",
		"text": "He is the wrong gender for this ward!",
		"urgency": 1
	};
	// Auth.$onAuth(function(authData) {if (!authData){
	// 	specialties.$destroy();
	// 	wards.$destroy();
	// }});
	$scope.addTask = function(newTask){
		var task = angular.copy(newTask);
		task.added = Stamp();
		console.log(task);
		var ref = tasksRef.push(task, function(error) {
			if (error){return console.error("There was a problem adding the task: ", error);}
			console.log("Added task");
		});
		$state.go('tasks.detail',{taskId:ref.key()});
	};
})
.controller('taskDetailController', function(
            // authData,Auth,
            $scope, comments, referrals, task,Stamp,TIMESTAMP,FB,taskId, allUsers,Profile){
	console.log('starting details controller');
	$scope.task = task;
	$scope.comments = comments;
	$scope.referrals = referrals;
	$scope.allUsers = allUsers;
	// Auth.$onAuth(function(authData) {if (!authData){
	// 	task.$destroy();
	// 	comments.$destroy();
	// 	referrals.$destroy();
	// }});
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
		task.$ref().update(updateObject, function(error){
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
		ref = FB.child('referrals').child(taskId).child(userId),
		stamp = Stamp();
		stamp.to = userName;
		ref.set(stamp,function(error){
			if (error){return console.error("There was a problem referring the task: ", error);}
			console.log("Task referred");
			ref.child('at').once("value", function(snap){
				 FB.child('taskboard').child(userId).child(taskId).set(snap.val(),function(error){
	 				if (error){return console.error("There was a problem posting the task to the user's taskboard: ", error);}
					console.log("Task posted to user's taskboard");
				 });
			});
		});
	};
})
;
})();
