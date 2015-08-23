(function(){
	angular.module('handover.tasks',['ui.router','firebase'])
	.config(function($stateProvider) {
		$stateProvider
		.state('tasks', {
			abstract: true,
			url: "/tasks",
			template: '<ui-view />',
			controller: function($scope,Tasks){
				$scope.tasks = Tasks;
			}
		})
		.state('tasks.overview', {
			url: "/",
			templateUrl: '/handover/tasks/overview.html'
		})
		.state('tasks.detail', {
			url: "/:taskId",
			templateUrl: '/handover/tasks/detail.html',
			controller: function($scope,$stateParams,Tasks,Comments){
				var taskId = $stateParams.taskId;
				$scope.taskId = taskId;
				$scope.task = Tasks[taskId];
				$scope.comments = Comments[taskId] || [];
				$scope.addComment = function(comment){
					$scope.comments.push({
						"user": "facebook:10205972431404310",
                     	"comment": comment,
                     	"timestamp": new Date().getTime()}
                 	);
				};
			}
		});
	})
	.factory('Comments',function(){
		return {
		    "-Jx51wQHnXZv8laqZZ8F" : [
			    {"user": "facebook:10205972431404310", "comment":"Habib m an", "timestamp":123432423},
			    {"user": "facebook:10205972431404310", "comment":"Habib sdfasdfm an", "timestamp":32132134},
			    {"user": "facebook:10205972431404310", "comment":"dsfsdfan", "timestamp":213123124}
		    ],
		    "-Jx51z0WgjdUjQhfOAWv" : [
		    	{"user": "facebook:10205972431404310", "comment":"dfsdfk;l", "timestamp":123432423},
			    {"user": "facebook:10205972431404310", "comment":"Habsdfsdasdfm an", "timestamp":32132134},
			    {"user": "facebook:10205972431404310", "comment":"dSDFS", "timestamp":213123124}
		    ]
		  };
	})
	.factory('Tasks',function(){
		return {
			"-Jx51wQHnXZv8laqZZ8F" : {
		      "accepted" : {
		        "timestamp" : 1439990495665,
		        "user" : "facebook:10205972431404310"
		      },
		      "added" : {
		        "timestamp" : 1439989221308,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 3
		    },
		    "-Jx51xylJ8Pmzlnb7saG" : {
		      "added" : {
		        "timestamp" : 1439989227671,
		        "user" : "facebook:10205972431404310"
		      },
		      "completed" : {
		        "timestamp" : 1439990498630,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 1
		    },
		    "-Jx51z0WgjdUjQhfOAWv" : {
		      "added" : {
		        "timestamp" : 1439989231946,
		        "user" : "facebook:10205972431404310"
		      },
		      "cancelled" : {
		        "reason" : "Hopeless",
		        "timestamp" : 1439990504505,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 2
		    },
		    "-Jx52-TNCaA-QTAKS8sI" : {
		      "added" : {
		        "timestamp" : 1439989237888,
		        "user" : "facebook:10205972431404310"
		      },
		      "cancelled" : {
		        "reason" : "Bad task",
		        "timestamp" : 1439990596800,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 1
		    },
		    "-Jx52-vPGPrHqlTnTsmu" : {
		      "added" : {
		        "timestamp" : 1439989239750,
		        "user" : "facebook:10205972431404310"
		      },
		      "completed" : {
		        "timestamp" : 1439990527826,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 3
		    },
		    "-Jx520Ac23DQkpEwBu5Q" : {
		      "accepted" : {
		        "timestamp" : 1439990583780,
		        "user" : "facebook:10205972431404310"
		      },
		      "added" : {
		        "timestamp" : 1439989240782,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 3
		    },
		    "-Jx520FVdov6Dl9H0r_E" : {
		      "added" : {
		        "timestamp" : 1439989241097,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 3
		    },
		    "-Jx520ZznWNtupNj-6ye" : {
		      "added" : {
		        "timestamp" : 1439989242409,
		        "user" : "facebook:10205972431404310"
		      },
		      "patient" : {
		        "bed" : "A12",
		        "name" : "Bob Geldof",
		        "nhi" : "LKJ1234",
		        "specialty" : "Cardiology",
		        "ward" : "AMU"
		      },
		      "text" : "Adventure time",
		      "urgency" : 1
		    }
		};
	})
	// .controller('TaskController',['$stateParams',function($stateParams){
	// 	$scope.p = $stateParams;
	// }])
	;
})();
