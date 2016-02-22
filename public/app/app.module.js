import { config } from './app.config.js';
import { routeConfig } from './app.route.js';
import { run } from './app.run.js';
import { SocketService } from './socket.service.js';
import { HomeController } from './home.controller.js';
import { RoomController } from './room.controller.js';

var app = angular
  .module('app', [
    'ui.router',
    'LocalStorageModule'
  ])
  .service('socketService', SocketService)
  .controller('homeController', HomeController)
  .controller('roomController', RoomController)
  .config(config)
  .config(routeConfig)
  .run(run);

export default 'app';
