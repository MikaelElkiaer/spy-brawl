class HomeController {
  constructor($rootScope) {
    this.$rootScope = $rootScope;

    this._setup();
  }

  _setup() {
    this.$rootScope.$on('welcome', (event, data) => {
      this.users = data.users;
      this.rooms = data.rooms;
    });
  }
}

HomeController.$inject = ['$rootScope'];

export { HomeController }
