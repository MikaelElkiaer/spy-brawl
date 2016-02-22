class SocketService {
  constructor($rootScope, $state) {
      this.$rootScope = $rootScope;
      this.$state = $state;
  }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });

    this.on('error', error => {
      var error = JSON.parse(error);
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
