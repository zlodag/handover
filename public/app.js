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
  .run(['$rootScope', 'Auth', 'Users',function($rootScope, Auth, Users) {
    // $rootScope.$on('$locationChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$locationChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeError',function(message){console.error(message);});
    // track status of authentication
    $rootScope.users = Users;
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
      if (user){$rootScope.authData = user;} else {$rootScope.authData = null;}
    });

    $rootScope.$on('$routeChangeSuccess', function(e,current,previous) {
      // console.log('Just changed route', current);
      $rootScope.route = current.name;
      // switch(current.loadedTemplateUrl){
      //   case "login/login.html":
      //     $rootScope.context = 'login';
      //     break;
      //   default:
      //     delete $rootScope.context;
      // }
      // $rootScope.route = current;
    });

  }]);
