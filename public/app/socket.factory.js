(function () {
  'use strict';

  angular
    .module('app')
    .factory('socket', factory);

  factory.$inject = ['$rootScope'];

  function factory($rootScope) {
    var socket = io.connect();

    var service = {
      emit: emit,
      on: on
    };
    return service;

    function emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }

    function on(eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }
  }
})();
