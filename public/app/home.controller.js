class HomeController {
  constructor($state, socketService) {
    this.$state = $state;
    this.socket = socketService;

    this._setup();
  }

  createRoom() {

  }

  joinRoom(roomId) {
    this.$state.go('room', { roomId });
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

HomeController.$inject = ['$state', 'socketService'];

export { HomeController }
