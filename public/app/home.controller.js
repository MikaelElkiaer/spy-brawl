class HomeController {
  constructor(socketService) {
    this.io = socketService;

    this._setup();
  }

  joinRoom(roomId) {
    console.log(`Joining room: ${roomId}...`);
  }

  _setup() {
    var self = this;

    this.io.on('welcome', data => {
      self.users = data.users;
      self.rooms = data.rooms;
    });

    this.io.on('user:connect', data => {
      self.users.push(data.user);
    });

    this.io.on('user:disconnect', data => {
      self.users.splice(self.users.indexOf(data.user));
    });
  }
}

HomeController.$inject = ['socketService'];

export { HomeController }
