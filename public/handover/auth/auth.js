(function(){
	angular.module('handover.auth',['firebase','handover.data','handover.tasks'])
		.factory('Auth',function(FB,$firebaseAuth){
			return $firebaseAuth(FB);
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
				controller: function($scope,Auth,$state){
					$scope.login = function(credentials){
						Auth.$authWithPassword(credentials).then(function(authData){
							$state.go('user',{userId:authData.uid});
						}).catch(function(error){
							console.error(error);
						});
					};
				}
			})
			.state('user', {
				url: "/user/:userId",
				templateUrl: '/handover/auth/user.html',
				resolve: {
					userId: function($stateParams){
						return $stateParams.userId;
					},
					taskboard: function(TaskBoard,userId){
						return TaskBoard(userId).$loaded();
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
