'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
describe('my app', function() {

  browser.get('/');

  it('should automatically redirect to /login when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/login");
    // expect(element.all(by.css('[ng-view]')).first().getText()).toMatch(/Login Page/);

  });

  // describe('login', function() {

  //   beforeEach(function() {
  //     browser.get('/login');
  //   });


  //   it('should render login when user navigates to /login', function() {
  //     expect(element.all(by.css('[ng-view] h2')).first().getText()).
  //       toMatch(/Login/);
  //   });

  // });


  // describe('chat', function() {
  //    beforeEach(function() {
  //       browser.get('/chat');
  //    });

  //    it('should render chat when user navigates to /chat', function() {
  //      expect(element.all(by.css('[ng-view] h2')).first().getText()).
  //        toMatch(/Chat/);
  //    });
  // });

   // describe('account', function() {
   //    it('should redirect to /login if not logged in', function() {
   //       browser.get('/account');
   //       expect(browser.getLocationAbsUrl()).toMatch('/login');
   //    });

   //    //todo https://github.com/firebase/angularFire-seed/issues/41
   // });

//    describe('login', function() {
//       beforeEach(function() {
//          browser.get('/login');
//           expect(browser.getLocationAbsUrl()).toMatch("/login");
//       });

//       it('should render login when user navigates to /login', function() {
//          browser.waitForAngular();
//          expect(element.all(by.css('*')).first().getText()).toMatch(/Login Page/);

//          // element.all(by.css('*')).each(function(element, index) {
//          //  // Will print 0 First, 1 Second, 2 Third.
//          //  element.getText().then(function (text) {
//          //    console.log(index, text);
//          //  });
// // });

//          // expect(element.all(by.css('[ng-view]')).first().getText()).toMatch(/Login Page/);
//       });

// //
// //      afterEach(function() {
// //         angularFireLogout();
// //      });
// //

//       //todo https://github.com/firebase/angularFire-seed/issues/41
// //
// //      it('should show error if no email', function() {
// //         expect(element('p.error').text()).toEqual('');
// //         input('email').enter('');
// //         input('pass').enter('test123');
// //         element('button[ng-click="login()"]').click();
// //         expect(element('p.error').text()).not().toEqual('');
// //      });
// //
// //      it('should show error if no password', function() {
// //         expect(element('p.error').text()).toEqual('');
// //         input('email').enter('test@test.com');
// //         input('pass').enter('');
// //         element('button[ng-click="login()"]').click();
// //         expect(element('p.error').text()).not().toEqual('')
// //      });
// //
// //      it('should log in with valid fields', function() {
// //         input('email').enter('test@test.com');
// //         input('pass').enter('test123');
// //         element('button[ng-click="login()"]').click();
// //         expect(element('p.error').text()).toEqual('');
// //      });
//    });
});
