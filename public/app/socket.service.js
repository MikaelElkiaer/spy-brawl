class SocketService {
  constructor($rootScope) {
      this.$rootScope = $rootScope;
      this.socket = io.connect({ query: `userId=${Math.ceil(Math.random() * 1000)}`});
  }

  emit(eventName, data, callback) {
    var self = this;
    this.socket.emit(eventName, data, function () {
      var args = arguments;
      self.$rootScope.$apply(function () {
        if (callback) {
          callback.apply(self.socket, args);
        }
      });
    })
  }

  on(eventName, callback) {
    var self = this;
    this.socket.on(eventName, function () {
      var args = arguments;
      self.$rootScope.$apply(function () {
        callback.apply(self.socket, args);
      });
    });
  }

}

SocketService.$inject = ['$rootScope']

export { SocketService }
