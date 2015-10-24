'use strict';

angular.module('handover')

.filter('compactTime',[function(){
	return function(timestamp){
		var ms = Date.now() - timestamp;
		var days = Math.floor(ms / (86400000));
		if (days) return days + 'd';
		var date = new Date(ms);
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();
		var seconds = date.getUTCSeconds();
		return hours ? (hours >= 10 ? (hours + 'h') : (hours + 'h' + minutes + 'm')) : (
			minutes ? (minutes >= 10 ? (minutes + 'm') : (minutes + 'm' + seconds + 's')) : (seconds + 's')
		);
	};
}]);
