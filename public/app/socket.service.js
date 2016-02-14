class SocketService {
  constructor($rootScope) {
      this.$rootScope = $rootScope;
      this.socket = io.connect();
  }

  emit(eventName, data, callback) {
    this.socket.emit(eventName, data, function () {
      var args = arguments;
      this.$rootScope.$apply(function () {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    })
  }

  on(eventName, callback) {
    this.socket.on(eventName, function () {
      var args = arguments;
      this.$rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  }

}

SocketService.$inject = ['$rootScope']

export { SocketService }
