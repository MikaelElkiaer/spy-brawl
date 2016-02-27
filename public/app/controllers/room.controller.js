class RoomController {
  constructor(params, socket, userService) {
    this.socket = socket;
    this.userService = userService;
    this.roomId = params.roomId;

    this.messages = [];
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
      this.messages.push(data.chatMsg);
    });
  }
}

RoomController.$inject = ['$stateParams', 'socketService', 'userService'];

export { RoomController };
