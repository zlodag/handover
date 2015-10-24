'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'myApp.account',
    'myApp.chat',
    'myApp.login'
  ])

  .config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
    $locationProvider.html5Mode(true);
  }])

  .run(['$rootScope', 'Auth', function($rootScope, Auth) {
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });
  }]);
