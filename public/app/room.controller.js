class RoomController {
  constructor(params, socket) {
    this.socket = socket;

    this._setup(params.roomId);
  }

  _setup(roomId) {
    this.socket.emit('join', { roomId }, data => {
      this.users = data.users;
    });
  }
}

RoomController.$inject = ['$stateParams', 'socketService'];

export { RoomController }
