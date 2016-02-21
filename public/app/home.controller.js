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

HomeController.$inject = ['$state', 'socketService'];

export { HomeController }
