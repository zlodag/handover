(function (angular) {
  "use strict";

  var app = angular.module('handover.profile', ['firebase', 'firebase.utils', 'firebase.auth', 'ngRoute']);

  app.controller('ProfileCtrl', ['$scope', 'Auth', 'fbutil', 'user', '$location', '$firebaseObject','specialties','roles',
    function($scope, Auth, fbutil, user, $location, $firebaseObject,specialties,roles) {

      $scope.specialties = specialties;
      $scope.roles = roles;


      var unbind;
      // create a 3-way binding with the user profile object in Firebase
      var profile = $firebaseObject(fbutil.ref('users', user.uid));
      profile.$bindTo($scope, 'me').then(function(ub) { unbind = ub; });

      // expose logout function to scope
      $scope.logout = function() {
        if( unbind ) { unbind(); }
        profile.$destroy();
        Auth.$unauth();
        $location.path('/login');
      };

      $scope.changePassword = function(passwordObj,confirm) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          Auth.$changePassword({email: profile.email, oldPassword: pass, newPassword: newPass})
            .then(function() {
              $scope.msg = 'Password changed';
            }, function(err) {
              $scope.err = err;
            })
        }
      };

      // $scope.clear = resetMessages;

      $scope.changeEmail = function(emailObj) {
        resetMessages();
        Auth.$changeEmail({oldEmail: oldEmail, newEmail: newEmail, password: pass})
          .then(function() {
            $scope.emailmsg = 'Email changed';
          }, function(err) {
            $scope.emailerr = err;
          });
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
      }
    }
  ]);

  app.config(['$routeProvider', function($routeProvider) {
    // require user to be authenticated before they can access this page
    // this is handled by the .whenAuthenticated method declared in
    // components/router/router.js
    $routeProvider.whenAuthenticated('/profile', {
      templateUrl: 'profile/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        specialties:['Specialties',function(Specialties){
          return Specialties.$loaded();
        }],
        roles:['Roles',function(Roles){
          return Roles.$loaded();
        }]
      }
    })
  }]);

})(angular);
