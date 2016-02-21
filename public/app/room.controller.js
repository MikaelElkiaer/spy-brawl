class RoomController {
  constructor(params, socket) {
    this.socket = socket;
    this.roomId = params.roomId;

    this._setup(this.roomId);
  }

  sendMessage() {
    this.socket.emit('msg', {
      roomId: this.roomId,
      chatMsg: this.chatMsg
    }, data => {

    });
    this.chatMsg = '';
  }

  _setup(roomId) {
    this.log = angular.element(document.querySelector('#chatLog'));

    this.socket.emit('join', { roomId }, data => {
      this.users = data.users;
    });

    this.socket.on('user:join', data => {
      this.users.push(data.user);
    });

    this.socket.on('user:disconnect', data => {
      this.users.splice(this.users.indexOf(data.user));
    });

    this.socket.on('user:msg', data => {
      this.log.prepend(data.chatMsg + '<br/>');
    });
  }
}

RoomController.$inject = ['$stateParams', 'socketService'];

export { RoomController }
