(function(){
	angular.module('handover.auth',['firebase','handover.data'])
		.factory('Profile',function(FB,$firebaseAuth,$firebaseObject,$q,TIMESTAMP){
			var authObj = $firebaseAuth(FB),
			authData = null, info = null;
			authObj.$onAuth(handleAuth);
			function handleAuth(data){
				authData = data;
				if (!authData) {
					info = null;
					console.log('Logged out');
				} else {
					console.log('Logged in as: ', authData.uid);
					refreshInfo(data).catch(console.error);
				}
			}
			function refreshInfo(data){
				var deferred = $q.defer();
				FB.child('users/index/'+data.uid).once('value', function(snap){
					info = snap.val();
					console.log('Successfully retrieved user info for %s %s (%s)', info.f, info.l, info.r);
					deferred.resolve(info);
				}, deferred.reject);
				return deferred.promise;
			}
			function updateRemote(indexOrDetails,object){
				console.log('attempting to update with ', object);
				var deferred = $q.defer();
				if (!authData){
					deferred.reject('You are not authenticated!');
				} else if (indexOrDetails !== 'index' && indexOrDetails !== 'details') {
					deferred.reject('The first argument must be "index" or "details"');
				} else {
					FB.child('users').child(indexOrDetails).child(authData.uid).update(object, function(error){
						if (error){deferred.reject(error);}
						else {deferred.resolve(authData);}
					})
				}
				return deferred.promise;
			}
			return {
				authObj: authObj,
				get authData(){return authData;},
				get info(){return info;},
				update: function(indexOrDetails,object){
					updateRemote(indexOrDetails,object).then(refreshInfo).catch(console.error);
				},
				ensureCurrent: function(){
					return authObj.$requireAuth().then(refreshInfo);
				},
				stamp: function(){
					this.at = TIMESTAMP
					this.by = info.f + ' ' + info.l;
					this.id = authData.uid;
					console.log('The stamp is',this);
				}
			};
		})
		.config(function($stateProvider) {
			$stateProvider
			.state('login', {
				url: "/login",
				// abstract: true,
				templateUrl: '/handover/auth/login.html',
				controller: function($scope,Profile,$state){
					$scope.profile = Profile;
					$scope.login = function(credentials){
						Profile.authObj.$authWithPassword(credentials).then(function(authData){
							$state.go('profile');
						}).catch(function(error){
							console.error(error);
						});
					};
				}
			})
			.state('profile', {
				url: "/profile",
				// abstract: true,
				templateUrl: '/handover/auth/profile.html',
				resolve : {
					profileInfo: function(Profile){
						return Profile.ensureCurrent();
					}
				},
				controller: function($scope,Profile,Hospital,$state){
					$scope.indexObject = angular.copy(Profile.info);
					$scope.profile = Profile;
					$scope.roles = Hospital.roles;
					$scope.logout = function(){
						Profile.authObj.$unauth();
						$state.go('login');
					};
					$scope.update = Profile.update;
				}
			})
		})
	;
})();
