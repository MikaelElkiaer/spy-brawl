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
    })

    .state('username', {
      url: '/username',
      templateUrl: '/views/username',
      controller: 'newUsernameController as newUsername'
    });
}

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

export { routeConfig }
