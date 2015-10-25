'use strict';

/* Directives */


angular.module('handover')

  .directive('appVersion', ['appName','version', function(appName,version) {
    return function(scope, elm) {
      elm.text(appName + ' v' + version);
    };
  }]);
