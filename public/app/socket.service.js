class SocketService {
  constructor($rootScope) {
      this.$rootScope = $rootScope;
      this.socket = io.connect({ query: 'userId=x'});

      this._setup();
  }

  _emit(eventName, data, callback) {
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

  _on(eventName, callback) {
    var self = this;
    this.socket.on(eventName, function () {
      var args = arguments;
      self.$rootScope.$apply(function () {
        callback.apply(self.socket, args);
      });
    });
  }

  _setup() {
    this._on('welcome', data => {
      console.log(data);
    });
  }

}

SocketService.$inject = ['$rootScope']

export { SocketService }
