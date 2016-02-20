class HomeController {
  constructor(socketService) {
    this.socket = socketService;

    this._setup();
  }

  createRoom() {
    console.log('Creating new room...');
  }

  joinRoom(roomId) {
    console.log(`Joining room: ${roomId}...`);
  }

  _setup() {
    this.socket.on('welcome', data => {
      this.users = data.users;
      this.rooms = data.rooms;
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
