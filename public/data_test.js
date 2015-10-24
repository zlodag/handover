
describe('Data', function() {
	var FB = null,Hospital;

	beforeEach(function(){

		module('mock.firebase');
		module('handover.data');

    inject(function (_$firebaseArray_, $firebaseUtils, _$timeout_, _testutils_) {
      testutils = _testutils_;
      $timeout = _$timeout_;
      $firebaseArray = _$firebaseArray_;
      $utils = $firebaseUtils;
      arr = stubArray(STUB_DATA);
    });



		// module(function($provide) {
		// 	$provide.value('FB', jasmine.createSpyObj('Fake Firebase',['child']));
		// 	// $provide.factory('$firebaseArray', function($q){
		// 	// 	return function(ref){
		// 	// 		var arr = ['AMU','A2','A3','A4'];
		// 	// 		var deferred = $q.defer();
		// 	// 		return {
		// 	// 			'$loaded': function(){
		// 	// 				return arr;
		// 	// 				deferred.resolve(arr);
		// 	// 				return deferred.promise;
		// 	// 			}
		// 	// 			// '$loaded': function(){
		// 	// 			// 	return deferred.promise.then(function(data){return data;});
		// 	// 			// },
		// 	// 			// resolve: function(){
		// 	// 			// 	deferred.resolve(arr);
		// 	// 			// }
		// 	// 		};
		// 	// 	};
		// 	// });

		module(function($provide) {
			$provide.factory('FB', function(){
				return new Firebase("https://nutm.firebaseio.com");
			});
		});

		inject(function($firebaseArray,_Hospital_){
			FB = $firebaseArray;
			spyOn(FB,'$loaded').and.callThrough();
			Hospital = _Hospital_;
			// Hospital.resolve();
		});


	});

  //   it('creates a hospital data promise object', function() {
		// // var HospitalFuture = Hospital.$loaded();
  // //    	expect(HospitalFuture).not.toBeDefined();
  // //    	Hospital.resolve();
  //    	// expect(Hospital.wards).not.toBeDefined();
  //    	// Hospital.$loaded();
  //    	expect(Hospital).not.toBeDefined();
  //   });
    it('calls the Firebase constructor to create references', function() {
	  expect(FB.child).toHaveBeenCalled();
    });

});
