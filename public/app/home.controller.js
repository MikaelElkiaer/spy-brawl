class HomeController {
  constructor(socketService) {
    this.socket = socketService;

    this._setup();
  }

  createRoom() {

  }

  _setup() {
    this.socket.emit('conn', null, data => {
      this.rooms = data.rooms;
      this.users = data.users;
    });

    this.socket.on('user:connect', data => {
      this.users.push(data.user);
    });

    this.socket.on('user:disconnect', data => {
      this.users.splice(this.users.indexOf(data.user));
    });
  }
}

HomeController.$inject = ['socketService'];

export { HomeController }
