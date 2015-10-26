'use strict';

/* jasmine specs for directives go here */

var $filter,filter,input,output;

describe('Time filters', function() {
  beforeEach(function(){
    module('handover');
  });
  beforeEach(inject(function(_$filter_){
    $filter = _$filter_;
  }));

  describe('compactTime', function(){
    beforeEach(function(){
      filter = $filter('compactTime');
    });
    afterEach(function(){
      expect(filter(input)).toEqual(output);
    });
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
  describe('fullTime', function(){
    beforeEach(function(){
      filter = $filter('fullTime');
    });
    afterEach(function(){
      expect(filter(input)).toEqual(output);
    });
    it('should correctly output the current time', function() {
      input = Date.now();
      output = '0 seconds';
    });
    it('should correctly output the time 1 second ago', function() {
      input = Date.now() - 1 * 1000;
      output = '1 second';
    });
    it('should correctly output the time 5 seconds ago', function() {
      input = Date.now() - 5 * 1000;
      output = '5 seconds';
    });
    it('should correctly output the time 15 seconds ago', function() {
      input = Date.now() - 15 * 1000;
      output = '15 seconds';
    });
    it('should correctly output the time 1 minute 15 seconds ago', function() {
      input = Date.now() - 15 * 1000 - 60 * 1000 * 1;
      output = '1 minute 15 seconds';
    });
    it('should correctly output the time 9 minutes 15 seconds ago', function() {
      input = Date.now() - 15 * 1000 - 60 * 1000 * 9;
      output = '9 minutes 15 seconds';
    });
    it('should correctly output the time 19 minutes 15 seconds ago', function() {
      input = Date.now() - 15 * 1000 - 60 * 1000 * 19;
      output = '19 minutes';
    });
    it('should correctly output the time 1 hour 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 1;
      output = '1 hour 19 minutes';
    });
    it('should correctly output the time 6 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 6;
      output = '6 hours 19 minutes';
    });
    it('should correctly output the time 16 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16;
      output = '16 hours';
    });
    it('should correctly output the time 1 day 16 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 1;
      output = '1 day';
    });
    it('should correctly output the time 3 days 16 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 3;
      output = '3 days';
    });
    it('should correctly output the time 43 days 16 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 43;
      output = '43 days';
    });
    it('should correctly output the time 4307 days 16 hours 19 minutes 15 seconds ago', function() {
      input = Date.now() - 5 * 1000 - 60 * 1000 * 19 - 60 * 1000 * 60 * 16 - 60 * 1000 * 60 * 24 * 4307;
      output = '4307 days';
    });
  });

});
