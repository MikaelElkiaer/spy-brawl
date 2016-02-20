class RoomController {
  constructor(socket) {
    this.socket = socket;

    this._setup();
  }

  _setup() {

  }
}

RoomController.$inject = ['socketService'];

export { RoomController }
