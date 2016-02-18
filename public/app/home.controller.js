class HomeController {
  constructor($rootScope) {
    this.$rootScope = $rootScope;

    this._setup();
  }

  _setup() {
    this.$rootScope.$on('welcome', (event, args) => {
      console.log(args);
    });
  }
}

HomeController.$inject = ['$rootScope'];

export { HomeController }
