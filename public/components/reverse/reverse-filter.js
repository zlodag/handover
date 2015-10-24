'use strict';

/* Filters */

angular.module('handover')
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  });
