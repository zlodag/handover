(function(){
angular.module('handover.tasks',['handover.data','ui.router','firebase'])
.factory('Event',function(){
	function Event(snap){
		this.$id = snap.key();
		this.data = snap.val();
	}
	Event.prototype = {
		addToDict : function(dict){
			if (('referral' in this.data) && !(this.data.referral in dict) && (this.data.referral !== this.by)){
				dict[this.data.referral] = this.$id;
				return true;
			}
			return false;
		},
	    update: function(snap) {
	        this.data = snap.val();
	        return true;
	    }
	};
	return Event;
})
.factory('EventsFactory', function($firebaseArray,Event,FB){
	return function(taskId){
		return $firebaseArray.$extend({
			alreadyReferred: function(uid){
				return ('_referralTargets' in this) && (uid in this._referralTargets);
			},
			$$added: function(snap){
				if ( !this._referralTargets ) { this._referralTargets = {}; }
				var rec = new Event(snap);
				rec.addToDict(this._referralTargets);
				return rec;
			},
		    $$updated: function(snap) {
		      var rec = this.$getRecord(snap.key());
		      return rec.update(snap);
		    },
		})(FB.child("events").orderByChild("task").equalTo(taskId));
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
		var ret =  'Cancelled' in this.info ? 'Cancelled' :
		('Completed' in this.info ? 'Completed' :
		('Accepted' in this.info ? 'Accepted' : 'Added'));
  		return ret;
	},
	goToDetail : function(){
		$state.go('tasks.detail',{taskId:this.$id});
	},
    update: function(snap) {
        angular.extend(this.info,snap.val());
        return true;
    },
	referTo: function(uid){
		if (!('events' in this)){return false;}
		var taskId = this.$id;
		var stamp = new Stamp(taskId);
		stamp.referral = uid;
		this.events.$add(stamp).then(function(referralRef){
			FB.child('taskboard/' + uid + '/' + taskId).set(referralRef.key());
		}).catch(function(error){
			FB.child('taskboard/' + uid + '/' + taskId).once("value",function(snap){
				if (snap.val() !== null){
					console.error('The referral has already been made');
				}
			});
		});
	},
	addComment: function(comment){
		if (!('events' in this)){return false;}
		var stamp = new Stamp(this.$id);
		stamp.comment = comment;
		this.events.$add(stamp);
	},
	newStatus: function(status){
		var taskId = this.$id;
		var taskRef = FB.child('tasks/' + taskId);
		var stamp = new Stamp(taskId);
		var updates = {};
		stamp.status = status;
		if (status === 'Cancelled'){
			updates.Cancelled = true;
			stamp.comment = prompt('Reason for cancelling','');
			if (!stamp.comment){
				console.error('Must have a reason...');
				return false;
			}
			status = 'Completed';
		}
		this.events.$add(stamp).then(function(eventRef){
			updates[status] = eventRef.key();
			taskRef.update(updates,function(error){
				if (error) {console.error(error);}
			});
		}).catch(console.error);
	}
  };
  return Task;
})
.factory("TaskListFactory", function($firebaseArray, Task,Stamp,Alerts) {
  return $firebaseArray.$extend({
	newTask: function(task){
		var stamp = new Stamp();
		angular.extend(stamp,task);
		var tasklist = this;
		this.$add(stamp).then(function(ref){
			tasklist.$getRecord(ref.key()).goToDetail();
		}, Alerts.add);
	},
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
			},
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
		controller: function($scope,wards,specialties,CurrentTasks,$window){
			var chance = $window.chance;
			var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', numbers = '1234567890';
			var wardlist = [];
			angular.forEach(wards,function(building,ward){
				wardlist.push(ward);
			});
			$scope.randomize = function(){
				$scope.newTask = {
					"patient": chance.name(),
					"nhi": chance.string({length: 3, pool: letters}) + chance.string({length: 4, pool: numbers}),
					"ward": chance.pick(wardlist),
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
				return CurrentTasks.newTask(newTask);
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
		controller: function($scope,context,tasks){
			$scope.context = context;
			$scope.tasks = tasks;
		}
	})
	.state('tasks.detail',{
		url: '/:taskId',
		templateUrl: '/handover/tasks/taskDetail.html',
		resolve: {
		    detail: function(TaskDetailFactory,$stateParams){
		    	return TaskDetailFactory($stateParams.taskId).$loaded();
		    }
		},
		controller: function($scope,detail){
			$scope.detail = detail;
		}
	})
})
;
})();
