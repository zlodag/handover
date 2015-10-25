'use strict';

// Declare app level module which depends on filters, and services
angular.module('handover', [
    'handover.config',
    'handover.security',
    // 'handover.home',
    'handover.profile',
    // 'handover.chat',
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
  // .service('MyData',function(UserDetailFactory,TaskBoard,Auth){

  //   var data = this;
  //   data.authData = null;
  //   data.userObj = null;
  //   data.userObjBinding = null;
  //   data.userObjPromise = null;
  //   data.taskboard = null;
  //   data.taskboardBinding = null;
  //   data.taskboardPromise = null;

  //   // function assertSame
  //   Auth.$onAuth(function(authData){
  //     data.authData = authData;
  //     if (data.userObjBinding) {
  //       data.userObjBinding();
  //       data.userObjBinding = null;
  //     }
  //     if (data.taskboardBinding) {
  //       data.taskboardBinding();
  //       data.taskboardBinding = null;
  //     }
  //     if (authData) {
  //       data.userObj = UserDetailFactory(authData.uid);
  //       data.userObjPromise = data.userObj.$loaded()
  //       data.taskboard = TaskBoard(authData.uid);
  //     } else {
  //       data.userObj.$destroy();
  //       data.userObj = null;
  //       data.taskboard.$destroy():
  //       data.taskboard = null;
  //     }
  //   });



  // })

  // .factory('Navigation','$rootScope','$location',function($rootScope,$location){
  //   $rootScope.$on('$routeChangeSuccess', function(e,current,previous) {
  //     console.log('Just changed route', current.locals);
  //     $rootScope.context = current.locals.context;
  //     // switch(current.loadedTemplateUrl){
  //     //   case "login/login.html":
  //     //     $rootScope.context = 'login';
  //     //     break;
  //     //   default:
  //     //     delete $rootScope.context;
  //     // }
  //     // $rootScope.route = current;
  //   });
  // })

  // .run(['$rootScope', 'Auth', 'Users',function($rootScope, Auth, Users) {
  .run(['$rootScope', 'Auth', 'Users','TaskBoard',function($rootScope, Auth, Users,TaskBoard) {
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
      $rootScope.route = current.name;
    });

  }]);
