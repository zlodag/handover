'use strict';

// Declare app level module which depends on filters, and services
angular.module('handover', [
    'handover.config',
    'handover.security',
    'handover.home',
    'handover.profile',
    'handover.chat',
    'handover.login',
    'handover.tasks'
  ])

  .config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
    $locationProvider.html5Mode(true);
  }])

  .run(['$rootScope', 'Auth', function($rootScope, Auth) {
    // $rootScope.$on('$locationChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$locationChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeStart',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeSuccess',function(message){console.log(message);});
    // $rootScope.$on('$routeChangeError',function(message){console.error(message);});
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });
  }]);
