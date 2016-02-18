import { SocketService } from './socket.service.js';
import { HomeController } from './home.controller.js';

var app = angular
  .module('app', [
    'ui.router'
  ])
  .service('socketService', SocketService)
  .controller('homeController', HomeController)
  .config(config)
  .run(run);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];
  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/public/views/home.view.html',
        controller: 'homeController as home'
      });
  }

  run.$inject = ['socketService'];
  function run (socket) {

  }

export default 'app';
