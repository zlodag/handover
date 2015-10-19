(function(){
	angular.module('handover.auth',['firebase','handover.data','ui.bootstrap'])
		.factory('Auth',function(FB,$firebaseAuth){
			return $firebaseAuth(FB);
		})
		.factory('Stamp',function(Auth,TIMESTAMP){
			return function(taskId){
				this.at = TIMESTAMP;
				this.by = Auth.$getAuth().uid;
				if(taskId){this.task = taskId;}
			};
		})
		// .factory('Me',function(UserDetailFactory,$q){
		// 	var details = null,
		// 	loggedIn = false,
		// 	deferred = $q.defer();
		// 	return {
		// 		get user(){return user;},
		// 		get loggedIn(){return loggedIn;},
		// 		get ready(){return deferred.promise;},
		// 		set: function (uid){
		// 			user = UserDetailFactory(uid);
		// 			user.$loaded().then(function(){
		// 				loggedIn = true;
		// 				console.log('Logged in as %s %s (%s)',user.f, user.l, user.r);
		// 				console.log('Contact: %s, Specialty: %s', user.contact, user.specialty);
		// 			}).catch(deferred.reject);
		// 		},
		// 		del: function(){
		// 			user = null;
		// 			loggedIn = false;
		// 			deferred = $q.defer();
		// 			console.log('Logged out');
		// 		}
		// 	};
		// })
		.config(function($stateProvider) {
			$stateProvider
			// .state('test', {
			// 	url: "/test",
			// 	templateUrl: '/handover/auth/test.html',
			// 	resolve: {
			// 	    specialties: function(Hospital){
			// 	    	return Hospital.specialties.$loaded();
			// 	    },
			// 	    // users: function(FB,$q){
			// 	    // 	var deferred = $q.defer();
			// 	    // 	FB.child('users/index').once("value",function(snap){
			//     	// 		deferred.resolve(snap.val());
			// 	    // 	});
			// 	    // 	return deferred.promise;
			// 	    // }
			// 	},
			// 	controller: function($scope,specialties){
			// 		$scope.list = ['alpha','gamma','marroon'];
			// 		// $scope.users = users;
			// 		// console.log(users);
			// 		$scope.getNames = function(){
			// 			var names = [];
			// 			for (var i = 0; i < specialties.length; i++) {
			// 				names.push(specialties.$keyAt(i));
			// 			}
			// 			console.log(names);
			// 			return names;
			// 		};
			// 	}
			// })
			.state('login', {
				url: "/login",
				templateUrl: '/handover/auth/login.html',
				controller: function($scope,Auth,$state){
					$scope.login = function(credentials){
						Auth.$authWithPassword(credentials).then(function(authData){
							// console.log('about to go to profile...');
							$state.go('profile');
						}).catch(function(error){
							console.error(error);
						});
					};
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
				controller: function($scope,Auth,me,specialties,roles,$state){
					me.$bindTo($scope,'me');
					$scope.specialties = specialties;
					$scope.roles = roles;
					$scope.logout = function(){
						Auth.$unauth();
						$state.go('login');
					};
				}
			})
			.state('user', {
				url: "/user/:userId",
				templateUrl: '/handover/auth/user.html',
				controller: function($scope, $stateParams){
					$scope.userId = $stateParams.userId;
				}
			})
		})
		// .factory('Taskboard',function(FB,$q){
		// 	return function(uid) {
		// 		FB.child('taskboard/'+uid).once("value",function(taskboardSnap){
		// 			var taskboard = this;
		// 			taskboardSnap.forEach(function(snap){
		// 				var key = snap.key(), value = snap.val();
		// 				var task = $q.defer(), referral = $q.defer();
		// 				FB.child('tasks/' + key).once("value",function(taskSnap){
		// 					task.resolve(taskSnap.val());
		// 				});
		// 				FB.child('referrals/' + value).once("value",function(referralSnap){
		// 					var referralInfo = referralSnap.val();
		// 					FB.child('users/index/' + referralInfo.by).once("value",function(personSnap){
		// 						referralInfo.by = personSnap.val();
		// 						referralInfo.by.id = personSnap.key();
		// 						referral.resolve(referralInfo);
		// 					})
		// 				});
		// 				taskboard[key] = {};
		// 				task.promise.then(function(taskInfo){
		// 					taskboard[key].task = taskInfo;
		// 				});
		// 				referral.promise.then(function(referralInfo){
		// 					taskboard[key].referral = referralInfo;
		// 				});
		// 			});
		// 		},this);
		// 	};
		// })
		// .factory('Taskboard',function(FB){
		// 	return function(uid){
		// 		)(FB.child('taskboard/'+uid));
		// 	};
		// })
		// .factory('Stamp',function(Me,TIMESTAMP){
		// 	return function(){
		// 		this.at = TIMESTAMP
		// 		this.by = Me.user.info.f + ' ' + Me.user.info.l;
		// 		this.id = Me.user.uid;
		// 	};
		// })
		// .factory('Profile',function(FB,Auth,$firebaseObject,$q,TIMESTAMP){
		// 	authData = null, info = null, details = null;
		// 	Auth.$onAuth(handleAuth);
		// 	function handleAuth(data){
		// 		authData = data;
		// 		if (!authData) {
		// 			info = null;
		// 			console.log('Logged out');
		// 		} else {
		// 			console.log('Logged in as: ', authData.uid);
		// 			refreshInfo(data).then(refreshDetails).catch(console.error);
		// 		}
		// 	}
		// 	function refreshInfo(data){
		// 		var deferred = $q.defer();
		// 		FB.child('users/index/'+data.uid).once('value', function(snap){
		// 			info = snap.val();
		// 			console.log('Successfully retrieved user info for %s %s (%s)', info.f, info.l, info.r);
		// 			deferred.resolve(data);
		// 		}, deferred.reject);
		// 		return deferred.promise;
		// 	}
		// 	function refreshDetails(data){
		// 		var deferred = $q.defer();
		// 		FB.child('users/details/'+data.uid).once('value', function(snap){
		// 			details = snap.val();
		// 			console.log('Successfully retrieved user details:', details);
		// 			deferred.resolve(data);
		// 		}, deferred.reject);
		// 		return deferred.promise;
		// 	}
		// 	function updateRemote(indexOrDetails,object){
		// 		if(angular.isDefined(object.contact) && !object.contact){
		// 			object.contact = null;
		// 		}
		// 		console.log('attempting to update with ', object);
		// 		var deferred = $q.defer();
		// 		if (!authData){
		// 			deferred.reject('You are not authenticated!');
		// 		} else if (indexOrDetails !== 'index' && indexOrDetails !== 'details') {
		// 			deferred.reject('The first argument must be "index" or "details"');
		// 		} else {
		// 			FB.child('users').child(indexOrDetails).child(authData.uid).update(object, function(error){
		// 				if (error){deferred.reject(error);}
		// 				else {deferred.resolve(authData);}
		// 			})
		// 		}
		// 		return deferred.promise;
		// 	}
		// 	return {
		// 		get authData(){return authData;},
		// 		get info(){return info;},
		// 		get details(){return details;},
		// 		update: function(indexOrDetails,object){
		// 			updateRemote(indexOrDetails,object).then(refreshInfo).then(refreshDetails).catch(console.error);
		// 		},
		// 		ensureCurrent: function(){
		// 			return Auth.$requireAuth().then(refreshInfo).then(refreshDetails);
		// 		},
		// 		stamp: function(){
		// 			this.at = TIMESTAMP
		// 			this.by = info.f + ' ' + info.l;
		// 			this.id = authData.uid;
		// 		}
		// 	};
		// })
		// .config(function($stateProvider) {
		// 	$stateProvider
		// 	.state('login', {
		// 		url: "/login",
		// 		templateUrl: '/handover/auth/login.html',
		// 		controller: function($scope,Profile,Auth,$state){
		// 			$scope.profile = Profile;
		// 			$scope.login = function(credentials){
		// 				Auth.$authWithPassword(credentials).then(function(authData){
		// 					$state.go('profile');
		// 				}).catch(function(error){
		// 					console.error(error);
		// 				});
		// 			};
		// 		}
		// 	})
		// 	.state('profile', {
		// 		url: "/profile",
		// 		templateUrl: '/handover/auth/profile.html',
		// 		resolve : {
		// 			authData: function(Auth){
		// 				return Auth.$requireAuth();
		// 			},
		// 			info: function(authData,FB,$firebaseObject){
		// 				return $firebaseObject(FB.child('users/index/'+authData.uid)).$loaded();
		// 			},
		// 		    specialties: function(Hospital){
		// 		    	return Hospital.specialties.$loaded();
		// 		    },
		// 		    roles: function(Hospital){
		// 		    	return Hospital.roles.$loaded();
		// 		    },
		// 			details: function(authData,FB,$firebaseObject){
		// 				return $firebaseObject(FB.child('users/details/'+authData.uid)).$loaded();
		// 			}
		// 		},
		// 		controller: function($scope,Auth,info,details,specialties,roles){
		// 			info.$bindTo($scope,'info');
		// 			details.$bindTo($scope,'details');
		// 			$scope.specialties = specialties;
		// 			$scope.roles = roles;
		// 			$scope.logout = function(){
		// 				Auth.$unauth();
		// 				$state.go('login');
		// 			};
		// 		}
		// 	})
		// 	.state('user', {
		// 		url: "/user/:userId",
		// 		templateUrl: '/handover/auth/user.html',
		// 		resolve: {
		// 			info: function($stateParams,FB,$firebaseObject){
		// 				console.log('retrieving info for user: ', $stateParams.userId);
		// 				return $firebaseObject(FB.child('users/index/' + $stateParams.userId)).$loaded();
		// 			},
		// 			details: function($stateParams,FB,$firebaseObject){
		// 				console.log('retrieving details for user: ', $stateParams.userId);
		// 				return $firebaseObject(FB.child('users/details/' + $stateParams.userId)).$loaded();
		// 			}
		// 		},
		// 		controller: function($scope, info, details){
		// 			$scope.user = {
		// 				info: info,
		// 				details: details
		// 			};
		// 		}
		// 	})
		// })
	;
})();
