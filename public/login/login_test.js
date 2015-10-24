
describe('handover.login', function() {
  beforeEach(function() {
    module('handover');
    module('handover.login');
  });

  describe('LoginCtrl', function() {

    // beforeEach(function($provide) {
    //   $provide('hospitalData', {});
    // });

    var loginCtrl, $scope;


    beforeEach(function() {
      module(function($provide) {
        $provide.value('specialties', ['O&G','Respiratory','Plastics']);
        $provide.value('roles', ['RMO','SMO','MDT']);
      });

      inject(function($controller) {
        $scope = {};
        // hospitalData = jasmine.createSpyObj('spyOnHospital',['then']);
        loginCtrl = $controller('LoginCtrl', {$scope: $scope});
      });
    });

    it('should define login function', function() {
      expect(typeof $scope.login).toBe('function');
    });

    it('should define createAccount function', function() {
      expect(typeof $scope.createAccount).toBe('function');
    });

    // it('should define login function', function() {
    //   expect(hospitalData.then).toHaveBeenCalled();
    // });
  });
});
