'use strict';

/* jasmine specs for directives go here */

describe('app-version directive', function() {
  beforeEach(function(){
    module('handover');
  });
  var $filter, compactTime,input,output;
  afterEach(inject(function(_$filter_){
    $filter = _$filter_;
    compactTime = $filter('compactTime');
    expect(compactTime(input)).toEqual(output);
  }));

  it('should correctly output the current time', function() {
    input = Date.now();
    output = '0s';
  });
  it('should correctly output the time 5 seconds ago', function() {
    input = Date.now() - 5 * 1000;
    output = '5s';
  });
  it('should correctly output the time 15 seconds ago', function() {
    input = Date.now() - 15 * 1000;
    output = '15s';
  });
  it('should correctly output the time 9 minutes 15 seconds ago', function() {
    input = Date.now() - 15 * 1000 - 60 * 1000 * 9;
    output = '9m15s';
  });
  it('should correctly output the time 19 minutes 15 seconds ago', function() {
    input = Date.now() - 15 * 1000 - 60 * 1000 * 19;
    output = '19m';
  });
  it('should correctly output the time 6 hours 19 minutes 15 seconds ago', function() {
    input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 6;
    output = '6h19m';
  });
  it('should correctly output the time 16 hours 19 minutes 15 seconds ago', function() {
    input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16;
    output = '16h';
  });
  it('should correctly output the time 3 days 16 hours 19 minutes 15 seconds ago', function() {
    input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 3;
    output = '3d';
  });
  it('should correctly output the time 43 days 16 hours 19 minutes 15 seconds ago', function() {
    input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 43;
    output = '43d';
  });
  it('should correctly output the time 4307 days 16 hours 19 minutes 15 seconds ago', function() {
    input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 4307;
    output = '4307d';
  });

});
