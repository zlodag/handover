(function(){
angular.module('handover.tasks',['handover.data','ui.router','firebase'])
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
.factory('EventsFactory', function($firebaseArray,Event,FB){
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
		})(FB.child("events").child(taskId).orderByChild("at"));
	};
})
.factory("Task", function($state,EventsFactory,Stamp,FB) {
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
		$state.go('tasks.detail',{taskId:this.$id});
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
		FB.update(updateObj,function(error){
			if (error){ console.log(error); }
			else if (status === 'Completed'){
				var eventRef = FB.child('events').child(taskId);
				// remove the taskboard entry arising from a user accepting task
				eventRef.child('Accepted').once("value",function(snap){
					if (snap.exists()){FB.child('taskboard').child(snap.val().by).child(taskId).remove();}
				});
				// remove all taskboard entries arising from referrals
				eventRef.orderByChild('referral').startAt(true).once("value",function(snap){
					snap.forEach(function(childSnap){
						FB.child('taskboard').child(childSnap.val().referral).child(taskId).remove();
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
		var eventKey = FB.push().key();
		var updateObj = {};
		updateObj['taskboard/' + uid + '/' + this.$id] = eventKey;
    	updateObj['events/' + this.$id + '/' + eventKey] = stamp;
		FB.update(updateObj);
		return true;
	},
	addComment: function(comment){
		var stamp = new Stamp();
		stamp.comment = comment;
		FB.child('events').child(this.$id).push(stamp);
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
.factory("CurrentTasks", function(TaskList,FB){
	return TaskList(FB.child('tasks').orderByChild("Completed").equalTo(null)
	                //.limitToLast(3)
	                );
})
.factory("RecentTasks", function(TaskList,FB){
	return TaskList(FB.child('tasks').orderByChild("Completed").startAt(true).limitToLast(10));
})
.factory("TaskBoard", function($firebaseArray,FB){
	return function(userId){
		return $firebaseArray(FB.child('taskboard').child(userId));
	};
})
.factory('TaskDetailFactory',function($firebaseObject,Task,FB,Stamp){
	return function(taskId){
		return $firebaseObject.$extend({
			$$updated: function(snap){
				if ('task' in this) {
					this.task.update(snap);
				} else {
					this.task = new Task(snap,true);
				}
				return true;
			}
		})(FB.child('tasks/' + taskId))
	};
})
.config(function($stateProvider) {
	$stateProvider.state('tasks', {
		url: "/tasks",
		abstract: true,
		template: '<ui-view></ui-view>'
	})
	.state('tasks.new',{
		url: '/new',
		templateUrl: '/handover/tasks/newTask.html',
		resolve: {
			authData: function(Auth){
				return Auth.$requireAuth();
			},
		    wards: function(Hospital){
		    	return Hospital.wards.$loaded();
		    },
		    specialties: function(Hospital){
		    	return Hospital.specialties.$loaded();
		    }
		},
		controller: function($scope,wards,specialties,$window,FB,Stamp,$state){
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
				var taskId = FB.push().key();
				var updateObj = {};
				updateObj['tasks/' + taskId] = task;
		    	updateObj['events/' + taskId + '/Added'] = stamp;
				FB.update(updateObj,function(error){
					if (error){console.error(error);}
					else {
						console.log('Added task successfully, id: ' + taskId);
						$state.go('tasks.detail',{taskId:taskId});
					}
				});
			};
		}
	})
	.state('tasks.list',{
		url: '/{context:current|recent}',
		templateUrl: '/handover/tasks/taskList.html',
		resolve: {
			context: function($stateParams){
				return $stateParams.context;
			},
			tasks: function(context,CurrentTasks,RecentTasks){
				if (context==='current'){return CurrentTasks.$loaded();}
				else if (context==='recent'){return RecentTasks.$loaded();}
			}
		},
		controller: function($scope,context,tasks,sortAccepted){
			$scope.context = context;
			$scope.tasks = tasks;
			$scope.sortAccepted = sortAccepted;
		}
	})
	.state('tasks.detail',{
		url: '/:taskId',
		templateUrl: '/handover/tasks/taskDetail.html',
		resolve: {
		    detail: function(TaskDetailFactory,$stateParams){
		    	return TaskDetailFactory($stateParams.taskId).$loaded();
		    },
		    waitForEvents: function(detail){
		    	return detail.task.events.$loaded();
	    	}
		},
		controller: function($scope,detail){
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
		}
	})
})
.factory('sortAccepted',function(){
	return function(rec){
		return rec.info.Accepted || 0;
	};
})
.directive('eventItem',function(){
	return {
		restrict:'A',
		scope:true,
		templateUrl:'/handover/tasks/event.html',
		link: function(scope, iElement, iAttrs){
			scope.event = scope.$eval(iAttrs.eventItem);
			iElement.addClass('event');
			if (!iElement.hasClass('preview')){
				if (scope.event.referral){iElement.addClass('referral');}
				else if (scope.event.status){iElement.addClass(scope.event.status);}
				// scope.watch('event')
			}
		}
	};
})
.directive('taskItem',function(){
	return {
		restrict:'A',
		scope:true,
		templateUrl:'/handover/tasks/task.html',
		link: function(scope, iElement, iAttrs){
			scope.task = scope.$eval(iAttrs.taskItem);
			iElement.addClass('task');
			iElement.on('click',function(){
				scope.task.goToDetail();
			});
		}
	};
})
.filter('compactTime',function(){
	return function(timestamp){
		var ms = Date.now() - timestamp;
		var date = new Date(ms);
		var days = date.getUTCDate() - 1;
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();
		var seconds = date.getUTCSeconds();
		return days ? (days + 'd') : (
			hours ? (hours >= 10 ? (hours + 'h') : (hours + 'h' + minutes + 'm')) : (
				minutes ? (minutes >= 10 ? (minutes + 'm') : (minutes + 'm' + seconds + 's')) : (seconds + 's')
			)
		);
	};
})
;
})();
