class SocketService {
  constructor($rootScope) {
      this.$rootScope = $rootScope;
  }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
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

SocketService.$inject = ['$rootScope']

export { SocketService }
