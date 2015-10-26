'use strict';


function pluralize(n,str){
	return n === 1 ? (1 + ' ' + str) : (n + ' ' + str + 's');
}
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
}])
.filter('fullTime',[function(){
	return function(timestamp){
		var ms = Date.now() - timestamp;
		var days = Math.floor(ms / (86400000));
		if (days) return pluralize(days,'day');
		var date = new Date(ms);
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();
		var seconds = date.getUTCSeconds();
		return hours ? (hours >= 10 ? pluralize(hours,'hour') : (pluralize(hours,'hour') + ' ' + pluralize(minutes,'minute'))) : (
			minutes ? (minutes >= 10 ? pluralize(minutes,'minute') : (pluralize(minutes,'minute') + ' ' + pluralize(seconds,'second'))) : pluralize(seconds,'second')
		);
	};
}])
;

