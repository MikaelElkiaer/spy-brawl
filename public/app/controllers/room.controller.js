class RoomController {
  constructor($state, params, socket, userService) {
    this.$state = $state;
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

  startGame() {
    this.socket.emit('startgame', {
      roomId: this.roomId
    });
  }

  _setup(roomId) {
    this.log = angular.element(document.querySelector('#chatLog'));

    this.socket.emit('join', { roomId }, (data, error) => {
      if (error) {
        this.$state.go('home');
      }
      else {
        this.users = data.users;
      }
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

RoomController.$inject = ['$state', '$stateParams', 'socketService', 'userService'];

export { RoomController };
