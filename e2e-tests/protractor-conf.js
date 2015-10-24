exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '*.js'
  ],
  seleniumAddress: 'http://localhost:4444/wd/hub',

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:5000/',

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
