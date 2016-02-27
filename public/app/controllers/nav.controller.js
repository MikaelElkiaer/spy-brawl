class NavController {
  constructor(userService) {
    this.userService = userService;

    this._setup();
  }

  changeUsernameModal() {
    
  }

  _setup () {
    this.username = this.userService.username;
  }
}

NavController.$inject = ['userService'];

export { NavController };
