function routeConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/views/home',
      controller: 'homeController as home'
    })

    .state('room', {
      url: '/room/:roomId',
      templateUrl: '/views/room',
      controller: 'roomController as room'
    });
}

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

export { routeConfig }
