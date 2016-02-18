import { SocketService } from './socket.service.js';

var app = angular
  .module('app', [
    'ui.router'
  ])
  .service('socketService', SocketService)
  .config(config)
  .run(run);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];
  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/public/views/home.view.html'
      });
  }

  run.$inject = ['socketService'];
  function run (socket) {

  }

export default 'app';
