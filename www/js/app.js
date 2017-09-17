// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('dermApp', ['ionic', 'ngCordova', 'ngIdle', 'dermApp.controllers', 'dermApp.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, KeepaliveProvider, IdleProvider) {

  IdleProvider.idle(600);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  /*
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'AppCtrl',
    onEnter: function(loginFactory, $state){
      //console.log(loginFactory.isLoggin());
      if(loginFactory.isLoggin() != true){
        console.log("No es usuario logueado");
        $state.go('login');
      }
    }
  })
  */

  // Each tab has its own nav history stack:

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'AppCtrl'
    })

  .state('identify', {
    url: '/identify',
    templateUrl: 'templates/identify.html',
    controller: 'IdentifyCtrl'  
  })

  .state('menu', {
      url: '/menu',
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl'
  })

  .state('paciente', {
      url: '/paciente',
      templateUrl: 'templates/paciente.html',
      controller: 'PatientCtrl'
  })

  .state('historico', {
      url: '/historico',
      templateUrl: 'templates/historico.html',
      controller: 'HistoricoCtrl'
  })

    .state('historico-detail', {
      url: '/historico/:id',
      templateUrl: 'templates/historico-detail.html',
      controller: 'HistoricoDetailCtrl',
      resolve: {
          message: ['$stateParams', function($stateParams){
              return {id:parseInt($stateParams.id, 10)};
          }]
      }
    })

    .state('test1', {
      url: '/test1',
      templateUrl: 'templates/test1.html',
      controller: 'Test1Ctrl'
    })

    .state('test2', {
      url: '/test2',
      templateUrl: 'templates/test2.html',
      controller: 'Test2Ctrl'
    })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
