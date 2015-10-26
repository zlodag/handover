'use strict';

angular.module('handover', [
    'handover.config',
    'handover.security',
    'handover.profile',
    'handover.login',
    'handover.tasks',
    'handover.user',
    'handover.data',
    'ngRoute'
  ])

  .config(['$routeProvider','$locationProvider',function ($routeProvider,$locationProvider) {
    $routeProvider.otherwise({
      redirectTo: '/login'
    });
    $locationProvider.html5Mode(true);
  }])
  .run(['$rootScope', 'Auth', 'Users','TaskBoard',function($rootScope, Auth, Users, TaskBoard) {
    // $rootScope.$on('$locationChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$locationChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeError',function(message){console.error(message);});
    // track status of authentication
    $rootScope.users = Users;
    $rootScope.loggedIn = false;
    $rootScope.authData = null;
    $rootScope.taskboard = null;
    $rootScope.route = null;

    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
      if (user){
        $rootScope.authData = user;
        $rootScope.taskboard = TaskBoard(user.uid);
      } else {
        $rootScope.authData = null;
        if($rootScope.taskboard) $rootScope.taskboard.$destroy();
        $rootScope.taskboard = null;
      }
    });

    $rootScope.$on('$routeChangeSuccess', function(e,current,previous) {
      if (current.name === 'userDetail'){
        $rootScope.route = current.pathParams.userId;
      } else {
        $rootScope.route = current.name;
      }
    });

  }]);
