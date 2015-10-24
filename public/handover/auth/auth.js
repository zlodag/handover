(function(){
	angular.module('handover.auth',['firebase','handover.data','handover.tasks'])
		.controller('LoginCtrl',function($scope,Auth,$state){
			$scope.login = function(credentials){
				Auth.$authWithPassword(credentials).then(function(authData){
					$state.go('user',{userId:authData.uid});
				}).catch(function(error){
					console.error(error);
				});
			};
		})
		.factory('MyData',function(TaskBoard,Auth){
			var taskboard = null,currentUid = null;
			Auth.$onAuth(function (authData){
				if (!authData) {
					currentUid = null;
					if (taskboard) taskboard.$destroy();
					taskboard = null;
				} else {
					setAndGet(authData.uid);
				}
			});
			function setAndGet(uid){
				if (uid !== currentUid){
					if (taskboard) taskboard.$destroy();
					currentUid = uid;
					taskboard = TaskBoard(uid);
				}
				return taskboard;
			}
			return {
				get taskboard(){return taskboard;},
				setAndGet: setAndGet
			};
		})
		.factory('Auth',function(FB,$firebaseAuth){
			var authObj = $firebaseAuth(FB);
			return authObj;
		})
		.factory('Stamp',function(Auth,TIMESTAMP){
			return function(){
				this.at = TIMESTAMP;
				this.by = Auth.$getAuth().uid;
			};
		})
		.config(function($stateProvider) {
			$stateProvider
			.state('login', {
				url: "/login",
				templateUrl: '/handover/auth/login.html',
				controller: "LoginCtrl"
			})
			.state('user', {
				url: "/user/:userId",
				templateUrl: '/handover/auth/user.html',
				resolve: {
					userId: function($stateParams){
						return $stateParams.userId;
					},
					authData: function(Auth){
						return Auth.$requireAuth();
					},
					taskboard: function(TaskBoard,userId,authData,MyData){
						var taskboard = authData.uid === userId ? MyData.setAndGet(authData.uid) : TaskBoard(userId);
						return taskboard.$loaded();
					},
					tasks: function(CurrentTasks){
						return CurrentTasks.$loaded();
					}
				},
				controller: function($scope, userId, taskboard, tasks, sortAccepted, Auth, $state){
					$scope.userId = userId;
					$scope.tasks = tasks;
					$scope.sortAccepted = sortAccepted;
					$scope.taskboardFilter = function(value, index, array){
						return taskboard.$indexFor(value.$id) !== -1;
					};
					$scope.logout = function(){
						Auth.$unauth();
						$state.go('login');
					};
					$scope.edit = function(){
						$state.go('profile');
					}
				}
			})
			.state('profile', {
				url: "/profile",
				templateUrl: '/handover/auth/profile.html',
				resolve : {
					authData: function(Auth){
						return Auth.$requireAuth();
					},
					me: function(authData,UserDetailFactory){
						return UserDetailFactory(authData.uid).$loaded();
					},
				    specialties: function(Hospital){
				    	return Hospital.specialties.$loaded();
				    },
				    roles: function(Hospital){
				    	return Hospital.roles.$loaded();
				    }
				},
				controller: function($scope,me,specialties,roles){
					me.$bindTo($scope,'me');
					$scope.specialties = specialties;
					$scope.roles = roles;
				}
			})
		})
	;
})();
