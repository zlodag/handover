
describe('handover.profile', function() {
  beforeEach(function() {
    module('handover');
    module('handover.profile');
  });

  describe('ProfileCtrl', function() {
    var profileCtrl, $scope;
    beforeEach(function() {

      module(function($provide) {
        $provide.value('specialties', ['O&G','Respiratory','Plastics']);
        $provide.value('roles', ['RMO','SMO','MDT']);
        $provide.value('authData', {uid: 'test123'});
      });

      inject(function($controller) {
        $scope = {};
        profileCtrl = $controller('ProfileCtrl', {$scope: $scope});
      });
    });

    it('should define logout method', function() {
      expect(typeof $scope.logout).toBe('function');
    });

    it('should define changePassword method', function() {
      expect(typeof $scope.changePassword).toBe('function');
    });

    it('should define changeEmail method', function() {
      expect(typeof $scope.changeEmail).toBe('function');
    });

    // it('should define clear method', function() {
    //   expect(typeof $scope.clear).toBe('function');
    // });
  });
});
