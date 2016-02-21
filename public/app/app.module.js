import { SocketService } from './socket.service.js';
import { HomeController } from './home.controller.js';
import { RoomController } from './room.controller.js';

var app = angular
  .module('app', [
    'ui.router'
  ])
  .service('socketService', SocketService)
  .controller('homeController', HomeController)
  .controller('roomController', RoomController)
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
      })

      .state('room', {
        url: '/room/:roomId',
        templateUrl: '/public/views/room.view.html',
        controller: 'roomController as room'
      });
  }

  run.$inject = ['socketService'];
  function run (socket) {
    socket.connect(Math.ceil(Math.random() * 1000));
  }

export default 'app';
