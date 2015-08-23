(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
			authData: function(Auth) {
				console.log('waiting 0');
				return Auth.$requireAuth();
		    },
		    tasksRef: function($window,authData){
				console.log('waiting 1');
				return new $window.Firebase("https://nutm.firebaseio.com/tasks");
			}
		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview.html',
		resolve: {
			tasks: function($firebaseArray,tasksRef){
				console.log('waiting 2');
				var ref = tasksRef.orderByChild("completed").equalTo(null);
				return $firebaseArray(ref).$loaded();
			},
			recent: function($firebaseArray,tasksRef){
				console.log('waiting 2.5');
				var ref = tasksRef.orderByChild("inactive").limitToLast(3);
				return $firebaseArray(ref).$loaded();
			}
		},
		controller: function($scope,tasks,recent,Auth){
			$scope.tasks = tasks;
			$scope.recent = recent;
			Auth.$onAuth(function(authData) {if (!authData){
				tasks.$destroy();
				recent.$destroy();
			}});
			$scope.glyph = function(urgency){
				if (urgency === 1) {return 'pushpin';}
				if (urgency === 2) {return 'info-sign';}
				if (urgency === 3) {return 'alert';}
				return 'apple';
			};
		}
	})
	.state('tasks.new', {
		url: "/new",
		templateUrl: '/handover/tasks/newTask.html',
		// template: "<p>New task</p>",
		resolve: {
			specialties: function(specialtyArray){
				console.log('waiting 3');
		    	return specialtyArray.$loaded();
		    },
		    wards: function(wardArray){
				console.log('waiting 4');
  		    	return wardArray.$loaded();
		    }
		},
		controller: 'newTaskController'
	})
	.state('tasks.detail', {
		url: "/:taskId",
		templateUrl: '/handover/tasks/detail.html',
		resolve: {
			comments: function($firebaseArray,$window,$stateParams){
				console.log('waiting 5');
				var ref = new $window.Firebase("https://nutm.firebaseio.com/comments").child($stateParams.taskId);
				return $firebaseArray(ref).$loaded();
			},
			task: function(tasksRef,$firebaseObject,$stateParams){
				console.log('waiting 6');
				var ref = tasksRef.child($stateParams.taskId);
				return $firebaseObject(ref).$loaded();
			}
		},
		controller: 'taskDetailController'
	})
	;
})
.controller('newTaskController', function($scope,authData,Auth,$state,specialties,wards,tasksRef,$window){
	$scope.specialties = specialties;
	$scope.wards = wards;
	$scope.newTask = {
  "patient": {
    "name": "Humphrey Herbert",
    "nhi": "LKJ1551",
    "ward": "M12",
    "bed": "5A",
    "specialty": "Obstetrics & Gynaecology"
  },
  "text": "He is the wrong gender for this ward!",
  "urgency": 1
};
	Auth.$onAuth(function(authData) {if (!authData){
		specialties.$destroy();
		wards.$destroy();
	}});
	$scope.addTask = function(newTask){
		var task = angular.extend({},newTask,{
			added : {
				user: {
					uid: authData.uid,
					name: $scope.profile.firstname + ' ' + $scope.profile.lastname
				},
				timestamp:$window.Firebase.ServerValue.TIMESTAMP
			}
		});
		console.log(task);
		var ref = tasksRef.push(task, function(error) {
			if (error){return console.error("There was a problem adding the task: ", error);}
			console.log("Added task");
		});
		$state.go('tasks.detail',{taskId:ref.key()});
	};
})
.controller('taskDetailController', function(authData,$scope,comments,task,$window,Auth){
	// console.log('starting details controller');
	$scope.task = task;
	$scope.comments = comments;
	Auth.$onAuth(function(authData) {if (!authData){
		task.$destroy();
		comments.$destroy();
	}});
	$scope.canStamp = function(stamp){
		if (stamp === 'accepted') { return !task.accepted && !task.completed;}
		else if (stamp === 'completed' || stamp === 'cancelled') { return !task.completed;}
		else { return false; }
	};
	$scope.stamp = function(stamp, cancelled){
		var updateObject = {};
		updateObject[stamp] = {
			user: {
				uid: authData.uid,
				name: $scope.profile.firstname + ' ' + $scope.profile.lastname
			},
			timestamp:$window.Firebase.ServerValue.TIMESTAMP
		};
		if (stamp === 'completed'){
			if (cancelled) {updateObject.completed.cancelled = cancelled;}
			updateObject.inactive = $window.Firebase.ServerValue.TIMESTAMP;
		}
		console.log(updateObject);
		task.$ref().update(updateObject, function(error){
			if (error){return console.error("There was a problem updating the task: ", error);}
			console.log('Updated task');
		});
	};
	$scope.addComment = function(comment){
		comments.$add({
			user: {
				uid: authData.uid,
				name: $scope.profile.firstname + ' ' + $scope.profile.lastname
			},
         	comment: comment,
         	timestamp: $window.Firebase.ServerValue.TIMESTAMP}
     	);
     	return true;
	};
})
;
})();
