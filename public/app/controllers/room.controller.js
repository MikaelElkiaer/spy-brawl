class RoomController {
  constructor($state, params, toastr, socket, userService) {
    this.$state = $state;
    this.toastr = toastr;
    this.socket = socket;
    this.userService = userService;
    this.roomId = params.roomId;
    this.isHost = false;

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
        this.toastr.error(error);
        this.$state.go('home');
      }
      else {
        this.users = data.users;
        this.isHost = data.isHost;
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

    this.socket.on('user:change-username', data => {
      this.users[this.users.indexOf(data.oldUsername)] = data.newUsername;
    });
  }
}

RoomController.$inject = ['$state', '$stateParams', 'toastr', 'socketService', 'userService'];

export { RoomController };
