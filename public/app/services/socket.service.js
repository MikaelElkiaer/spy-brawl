class SocketService {
  constructor($rootScope, $state, userService) {
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.userService = userService;
  }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });

    this.socket.emit('conn', null, data => {
      this.userService.userSid = data.userSid;
      this.userService.username = data.username;
    });

    this.on('error', e => {
      var error = JSON.parse(e);
    });
  }

  emit(eventName, data, callback) {
    this.socket.emit(eventName, data, (...args) => {
      var cArgs = args;
      this.$rootScope.$apply(() => {
        if (callback) {
          callback.apply(this.socket, cArgs);
        }
      });
    });
  }

  on(eventName, callback) {
    this.socket.on(eventName, (...args) => {
      var cArgs = args;
      this.$rootScope.$apply(() => {
        callback.apply(this.socket, cArgs);
      });
    });
  }

}

SocketService.$inject = ['$rootScope', '$state', 'userService'];

export { SocketService };
