(function(){
angular.module('handover.tasks',['handover.data','ngRoute','firebase','firebase.utils'])
.factory('Event',function(){
	function Event(snap){
		this.data = snap.val();
		var key = snap.key();
		this.$id = key;
        if (key === 'Added' || key === 'Accepted' || key === 'Completed' || key === 'Cancelled'){
        	this.data.status = key;
        }
	}
	Event.prototype = {
		addToDict : function(dict){
			var userId;
			if ('referral' in this.data) {
				userId = this.data.referral;
			} else if (this.data.status === 'Accepted') {
				userId = this.data.by;
			} else {
				return false;
			}
			dict[userId] = this.$id;
			return true;
		}
	};
	return Event;
})
.factory('EventsFactory', function($firebaseArray,Event,fbutil){
	return function(taskId){
		return $firebaseArray.$extend({
			disableReferral: function(uid){
				return (('_referralTargets' in this) && (uid in this._referralTargets));
			},
			$$added: function(snap){
				if ( !this._referralTargets ) { this._referralTargets = {}; }
				var rec = new Event(snap);
				rec.addToDict(this._referralTargets);
				return rec;
			}
		})(fbutil.ref("events",taskId).orderByChild("at"));
	};
})
.factory("Task", function($location,EventsFactory,Stamp,fbutil) {
  function Task(snap,includeEvents) {
    this.$id = snap.key();
    var data = snap.val();
    if (angular.isObject(data)){this.info = data;}
    if (includeEvents){this.events = EventsFactory(this.$id);}
  }
  Task.prototype = {
  	getStatus : function(){
		if('Cancelled' in this.info){return {status:'Cancelled',at:this.info.Completed};}
		if('Completed' in this.info){return {status:'Completed',at:this.info.Completed};}
		if('Accepted' in this.info){return {status:'Accepted',at:this.info.Accepted};}
		return {status:'Added',at:this.info.Added};
	},
	getUrgency : function(){
		return ['error','low','medium','high'][this.info.urgency];
	},
	goToDetail : function(){
		$location.path('/task/'+this.$id);
	},
    update: function(snap) {
        this.info = snap.val();
        return true;
    },
    newEvent: function(eventObj){
    	if (eventObj.status){
    		return this.newStatus(eventObj.status,eventObj.comment);
    	}
    	if (eventObj.referral){
    		return this.referTo(eventObj.referral,eventObj.comment);
    	}
		return this.addComment(eventObj.comment);
    },
	newStatus: function(status,comment){
		var taskId = this.$id;
		var updateObj = {};
		var stamp = new Stamp();
		if (comment){stamp.comment = comment;}
    	updateObj['events/' + taskId + '/' + status] = stamp;
		if (status === 'Cancelled'){
			if (!comment) {
				console.error('Reason required');
				return false;
			}
			updateObj['tasks/' + taskId + '/Cancelled'] = true;
			status = 'Completed';
		} else if (status === 'Accepted') {
			// add to my taskboard
			updateObj['taskboard/' + stamp.by + '/' + taskId] = true;
		} else if (status !== 'Completed') {
			console.error('Invalid status');
			return false;
		}
		updateObj['tasks/' + taskId + '/' + status] = stamp.at;
		fbutil.ref().update(updateObj,function(error){
			if (error){ console.error(error); }
			else if (status === 'Completed'){
				var eventRef = fbutil.ref('events',taskId);
				// remove the taskboard entry arising from a user accepting task
				eventRef.child('Accepted').once("value",function(snap){
					if (snap.exists()){fbutil.ref('taskboard',snap.val().by,taskId).remove();}
				});
				// remove all taskboard entries arising from referrals
				eventRef.orderByChild('referral').startAt(true).once("value",function(snap){
					snap.forEach(function(childSnap){
						fbutil.ref('taskboard',childSnap.val().referral,taskId).remove();
					});
				});
			}
		});
		return true;
	},
	referTo: function(uid,comment){
		var stamp = new Stamp();
		stamp.referral = uid;
		if (comment){stamp.comment = comment;}
		var eventKey = fbutil.ref().push().key();
		var updateObj = {};
		updateObj['taskboard/' + uid + '/' + this.$id] = eventKey;
    	updateObj['events/' + this.$id + '/' + eventKey] = stamp;
		fbutil.ref().update(updateObj);
		return true;
	},
	addComment: function(comment){
		var stamp = new Stamp();
		stamp.comment = comment;
		fbutil.ref('events',this.$id).push(stamp);
		return true;
	}
  };
  return Task;
})
.factory("TaskListFactory", function($firebaseArray, Task) {
  return $firebaseArray.$extend({
    $$added: function(snap) {
      return new Task(snap,false);
    },
    $$updated: function(snap) {
      var rec = this.$getRecord(snap.key());
      return rec.update(snap);
    },
  });
})
.factory("TaskList", function(TaskListFactory) {
  return function(ref) {
    return new TaskListFactory(ref);
  }
})
.factory("CurrentTasks", function(TaskList,fbutil){
	return TaskList(fbutil.ref('tasks').orderByChild("Completed").equalTo(null)
	                //.limitToLast(3)
	                );
})
.factory("RecentTasks", function(TaskList,fbutil){
	return TaskList(fbutil.ref('tasks').orderByChild("Completed").startAt(true).limitToLast(10));
})
.factory("TaskBoard", function($firebaseArray,fbutil){
	return function(userId){
		return $firebaseArray(fbutil.ref('taskboard',userId));
	};
})
.factory('TaskDetailFactory',function($firebaseObject,Task,fbutil,Stamp){
	return function(taskId){
		return $firebaseObject.$extend({
			eventsLoaded: function(){
				return this.$loaded().then(function(task){
					return task.task.events.$loaded().then(function(events){
						return task;
					})
				});
			},
			$$updated: function(snap){
				if ('task' in this) {
					this.task.update(snap);
				} else {
					this.task = new Task(snap,true);
				}
				return true;
			}
		})(fbutil.ref('tasks',taskId))
	};
})

.controller('NewTaskCtrl',function($scope,wards,specialties,$window,fbutil,Stamp,$location){
	var chance = $window.chance;
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', numbers = '1234567890';
	$scope.randomize = function(){
		$scope.newTask = {
			"patient": chance.name(),
			"nhi": chance.string({length: 3, pool: letters}) + chance.string({length: 4, pool: numbers}),
			"ward": chance.pick(wards).$id,
			"bed": chance.natural({min: 1, max: 16}).toString() + chance.character({pool: 'ABCDEF'}),
			"specialty": chance.pick(specialties).$id,
			"text": chance.sentence(),
			"urgency": chance.natural({min: 1, max: 3})
		};
	};
	$scope.randomize();
	$scope.wards = wards;
	$scope.specialties = specialties;
	$scope.addTask = function(newTask){
		var stamp = new Stamp();
		var task = angular.extend({'Added':stamp.at},newTask);
		var taskId = fbutil.ref().push().key();
		var updateObj = {};
		updateObj['tasks/' + taskId] = task;
    	updateObj['events/' + taskId + '/Added'] = stamp;
		fbutil.ref().update(updateObj,function(error){
			if (error){console.error(error);}
			else {
				$location.path('/task/'+taskId);
				$scope.$apply();
			}
		});
	};
})
.controller('TaskListCtrl',function($scope,tasks,sortAccepted){
	$scope.tasks = tasks;
	$scope.sortAccepted = sortAccepted;
})
.controller('TaskDetailCtrl',function($scope,detail){
	$scope.detail = detail;
	$scope.newEvent = {};
	$scope.statusObj = {
        'Accepted':'Accept task',
        'Completed':'Complete task',
        'Cancelled':'Cancel task'
    };
	$scope.reset = function(){
		$scope.newEvent.by = $scope.authData ? $scope.authData.uid : null;
		$scope.newEvent.at = new Date();
		delete $scope.newEvent.status;
		delete $scope.newEvent.referral;
		delete $scope.newEvent.comment;
	};
	$scope.reset();
})
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/new', {
	  templateUrl: 'tasks/newTask.html',
	  controller: 'NewTaskCtrl',
	  name: 'new',
	  resolve: {
	    specialties:['Specialties',function(Specialties){
	      return Specialties.$loaded();
	    }],
	    wards:['Wards',function(Wards){
	      return Wards.$loaded();
	    }]
	  }
	})
	.when('/current', {
	  templateUrl: 'tasks/taskList.html',
	  controller: 'TaskListCtrl',
	  name: 'current',
	  resolve: {
		tasks: function(CurrentTasks){
			return CurrentTasks.$loaded();
		}
	  }
	})
	.when('/recent', {
	  templateUrl: 'tasks/taskList.html',
	  controller: 'TaskListCtrl',
	  name: 'recent',
	  resolve: {
		tasks: function(RecentTasks){
			return RecentTasks.$loaded();
		}
	  }
	})
	.when('/task/:taskId', {
	  templateUrl: 'tasks/taskDetail.html',
	  controller: 'TaskDetailCtrl',
	  name: 'detail',
	  resolve: {
	    detail: function(TaskDetailFactory,$route){
	      return TaskDetailFactory($route.current.params.taskId).eventsLoaded();
	  	}
	  }
	})
	;
}])

.factory('sortAccepted',function(){
	return function(rec){
		return rec.info.Accepted || 0;
	};
})
.directive('eventItem',function(){
	return {
		restrict:'A',
		scope:true,
		templateUrl:'tasks/event.html',
		link: function(scope, iElement, iAttrs){
			scope.event = scope.$eval(iAttrs.eventItem);
			iElement.addClass('event');
			if (!iElement.hasClass('preview')){
				if (scope.event.referral){iElement.addClass('referral');}
				else if (scope.event.status){iElement.addClass(scope.event.status);}
			} else {
				iElement.append('<input type="submit" value="Submit!" ng-disabled="eventForm.$invalid" />');
			}
		}
	};
})
.directive('taskItem',function(){
	return {
		restrict:'A',
		scope:true,
		templateUrl:'tasks/task.html',
		link: function(scope, iElement, iAttrs){
			scope.task = scope.$eval(iAttrs.taskItem);
// 			iElement.wrap('<a href="/task/' + scope.task.$id + '"></a>');
			// iElement.addClass('task');
// 			iElement.on('click',function(){
// 				scope.task.goToDetail();
// 				scope.$apply();
// 			});
		}
	};
})
;
})();
