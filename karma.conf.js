module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-route/angular-route.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
      'public/bower_components/mockfirebase/browser/mockfirebase.js',
      'public/bower_components/angularfire/dist/angularfire.js',
      'test/lib/**/*.js',
      'public/app.js',
      'public/config.js',
      'public/config_test.js',
      'public/components/**/*.js',
      'public/data.js',
      'public/profile/**/*.js',
      'public/login/**/*.js',
      'public/tasks/**/*.js',
      'public/user/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],
    preprocessors: {
      '*.js': ['jshint']
    },
    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-jshint-preprocessor'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
