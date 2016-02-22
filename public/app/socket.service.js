class SocketService {
  constructor($rootScope, $state) {
      this.$rootScope = $rootScope;
      this.$state = $state;
  }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });

    this.on('error', error => {
      var error = JSON.parse(error);
      switch (error.code) {
        case 1:
        case 2:
          this.$state.go('newUsername', { errorCode: error.code, callbackState: this.$state.$current.self.name });
          break;
        default:
          console.log('unhandled error...');
          break;
      }
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
    })
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

SocketService.$inject = ['$rootScope', '$state']

export { SocketService }
