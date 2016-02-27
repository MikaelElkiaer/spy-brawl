import { config } from './app.config.js';
import { routeConfig } from './app.route.js';
import { run } from './app.run.js';
import { SocketService } from './services/socket.service.js';
import { UserService } from './services/user.service.js';
import { NavController } from './controllers/nav.controller.js';
import { HomeController } from './controllers/home.controller.js';
import { RoomController } from './controllers/room.controller.js';

var app = angular
  .module('app', [
    'ngTouch',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'LocalStorageModule',
    'toastr'
  ])
  .service('socketService', SocketService)
  .service('userService', UserService)
  .controller('navController', NavController)
  .controller('homeController', HomeController)
  .controller('roomController', RoomController)
  .config(config)
  .config(routeConfig)
  .run(run);

export default 'app';
