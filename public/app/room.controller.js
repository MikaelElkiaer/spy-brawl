class RoomController {
  constructor(params, socket) {
    this.socket = socket;

    this._setup(params.roomId);
  }

  _setup(roomId) {
    this.socket.emit('join', { roomId }, data => {
      this.users = data.users;
    });

    this.socket.on('user:join', data => {
      this.users.push(data.user);
    });

    this.socket.on('user:disconnect', data => {
      this.users.splice(this.users.indexOf(data.user));
    });
  }
}

RoomController.$inject = ['$stateParams', 'socketService'];

export { RoomController }
