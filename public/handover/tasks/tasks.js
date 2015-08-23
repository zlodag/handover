(function(){angular.module('handover.tasks',['ui.router','firebase','handover.data'])
.config(function($stateProvider) {
	$stateProvider
	.state('tasks', {
		abstract: true,
		url: "/tasks",
		template: '<ui-view />',
		resolve: {
			authData: function(Auth) {
				return Auth.$requireAuth();
		    },
		    tasks: function($firebaseArray,$window,authData){
				var ref = new $window.Firebase("https://nutm.firebaseio.com/tasks");
				return $firebaseArray(ref).$loaded();
			}
		},
		controller: function($scope,tasks,$rootScope,Auth){
			$scope.tasks = tasks;
			Auth.$onAuth(function(authData) {if (!authData){
				tasks.$destroy();
			}});
			// $rootScope.$on("logout", function() {
			// 	tasks.$destroy();
			// });
		}
	})
	.state('tasks.overview', {
		url: "/",
		templateUrl: '/handover/tasks/overview.html'
	})
	.state('tasks.new', {
		url: "/new",
		templateUrl: '/handover/tasks/newTask.html',
		// template: "<p>New task</p>",
		resolve: {
			specialties: function(specialtyArray){
		    	return specialtyArray.$loaded();
		    },
		    wards: function(wardArray){
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
				var ref = new $window.Firebase("https://nutm.firebaseio.com/comments").child($stateParams.taskId);
				return $firebaseArray(ref).$loaded();
			},
			task: function($stateParams, tasks){
				return tasks.$getRecord($stateParams.taskId);
			}
		},
		controller: 'taskDetailController'
	})
	;
})
.controller('newTaskController', function($scope,$window,authData,tasks,$state,specialties,wards){
	$scope.specialties = specialties;
	$scope.wards = wards;
	$scope.addTask = function(newTask){
		var mock = {
		  "patient": {
		    "ward": "A2",
		    "specialty": "General Medicine",
		    "name": "Banjo Kazooie",
		    "nhi": "LKJ1234",
		    "bed": "6A"
		  },
		  "text": "Help me get this guy off the bed",
		  "urgency": 2
		};
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
		tasks.$add(task)
		.then(function(ref) {
			console.log("added record with id " + ref.key());
			$state.go('tasks.detail',{taskId:ref.key()});
			// list.$indexFor(id); // returns location in the array
		}, function(error){
			console.error("there was a problem", error);
		});
	};
})
.controller('taskDetailController', function(authData,$scope,comments,task,tasks,$window,Auth){
	$scope.task = task;
	$scope.comments = comments;
	Auth.$onAuth(function(authData) {if (!authData){
		comments.$destroy();
	}});
	// $rootScope.$on("logout", function() {
	// 	comments.$destroy();
	// });
	$scope.canStamp = function(stamp){
		if (stamp === 'accepted') { return !task.accepted && !task.completed && !task.cancelled;}
		else if (stamp === 'completed' || stamp === 'cancelled') { return !task.completed && !task.cancelled;}
		else { return false; }
	};
	$scope.stamp = function(stamp, reason){
		var newStamp = {
			user: {
				uid: authData.uid,
				name: $scope.profile.firstname + ' ' + $scope.profile.lastname
			},
			timestamp:$window.Firebase.ServerValue.TIMESTAMP
		};
		if (reason) {newStamp.reason = reason;}
		console.log(newStamp);
		var ref = new $window.Firebase("https://nutm.firebaseio.com/tasks").child(task.$id).child(stamp);
		ref.set(newStamp);
		// tasks.$update();
	}
	$scope.addComment = function(comment){
		comments.$add({
			user: authData.uid,
         	comment: comment,
         	timestamp: $window.Firebase.ServerValue.TIMESTAMP}
     	);
	};
})
;
})();
