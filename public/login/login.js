"use strict";
angular.module('handover.login', ['firebase.utils', 'firebase.auth', 'ngRoute','handover.data'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html',
      resolve: {
        specialties:['Specialties',function(Specialties){
          return Specialties.$loaded();
        }],
        roles:['Roles',function(Roles){
          return Roles.$loaded();
        }]
      }
    });
  }])

  .controller('LoginCtrl', ['$scope', 'Auth', '$location', 'fbutil','specialties','roles',
              function($scope, Auth, $location, fbutil, specialties, roles) {

                // console.log(hospitalData);
    $scope.specialties = specialties;
    $scope.roles = roles;

    $scope.credentials = {};
    $scope.me = {};
    $scope.createMode = false;

    $scope.login = function(credentials) {
      $scope.err = null;
      Auth.$authWithPassword(credentials)
        .then(function(/* user */) {
          $location.path('/profile');
        }, function(err) {
          $scope.err = errMessage(err);
        });
    };

    $scope.createAccount = function(credentials,me) {
      $scope.err = null;
      if( assertValidAccountProps(credentials,me) ) {
        // create user credentials in Firebase auth system
        Auth.$createUser(credentials)
          .then(function() {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword(credentials);
          })
          .then(function(user) {
            // create a user profile in our data store
            var ref = fbutil.ref('users', user.uid);
            return fbutil.handler(function(cb) {
              ref.set(me, cb);
            });
          })
          .then(function(/* user */) {
            // redirect to the profile page
            $location.path('/profile');
          }, function(err) {
            $scope.err = errMessage(err);
          });
      }
    };

    function assertValidAccountProps(credentials,me) {
      if( !credentials.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !credentials.password ) {
        $scope.err = 'Please enter a password';
      }
      else if( !credentials.confirm ) {
        $scope.err = 'Please confirm your password';
      }
      else if( credentials.password !== credentials.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else if( !me.first ) {
        $scope.err = 'Please enter your first name';
      }
      else if( !me.last ) {
        $scope.err = 'Please enter your last name';
      }
      else if( !me.role ) {
        $scope.err = 'Please select your role';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }

  }]);
