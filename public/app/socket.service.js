class SocketService {
  constructor($rootScope, $state) {
      this.$rootScope = $rootScope;
      this.$state = $state;
  }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });

    this.on('error', error => {
      var error = JSON.parse(error);
      console.log(error);
      switch (error.code) {
        case 1:
          console.log('no userSid or username, redirect to new user view...');
          break;
        case 2:
          console.log('userSid is dead, drop it and redirect to new user view...');
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
