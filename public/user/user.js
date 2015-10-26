(function (angular) {
  "use strict";

angular.module('handover.user', ['handover.tasks','ngRoute','firebase.auth'])
  .controller('UserCtrl',['$scope','taskboard','tasks','userId','sortAccepted','Auth','$location',function($scope,taskboard,tasks,userId,sortAccepted,Auth,$location){
      $scope.userId = userId;
      $scope.tasks = tasks;
      $scope.taskboard = taskboard;
      $scope.sortAccepted = sortAccepted;
      $scope.taskboardFilter = function(value, index, array){
        return taskboard.$indexFor(value.$id) !== -1;
      };
      $scope.countAccepted = function(){
        var n = 0, i;
        for (i = 0; i < taskboard.length; i++) {
          if (taskboard[i].$value === true) n++;
        }
        return n;
      };
      $scope.logout = function(){
        Auth.$unauth();
        $location.path('/login');
      };
      $scope.edit = function(){
        $location.path('/profile');
      };
  }])
  .config(['$routeProvider', function($routeProvider) {
    // require user to be authenticated before they can access this page
    // this is handled by the .whenAuthenticated method declared in
    // components/router/router.js
    $routeProvider.whenAuthenticated('/user/:userId', {
      templateUrl: 'user/user.html',
      controller: 'UserCtrl',
      name: 'userDetail',
      resolve: {
        userId: ['$route',function($route){
          return $route.current.params.userId;
        }],
        taskboard:['TaskBoard','$route',function(TaskBoard,$route){
          return TaskBoard($route.current.params.userId).$loaded();
        }],
        tasks:['CurrentTasks',function(CurrentTasks){
          return CurrentTasks.$loaded();
        }]
      }
    })
    ;
  }])
  ;
})(angular);
