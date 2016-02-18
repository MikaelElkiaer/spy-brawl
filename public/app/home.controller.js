class HomeController {
  constructor($rootScope) {
    this.$rootScope = $rootScope;

    this._setup();
  }

  _setup() {
    this.$rootScope.$on('welcome', (event, args) => {
      this.rooms = args.rooms;
    });
  }
}

HomeController.$inject = ['$rootScope'];

export { HomeController }
