(function () {
  'use strict';

  angular
    .module('app')
    .controller('socketController', controller);

  controller.$inject = ['socketService'];

  function controller(socket) {
    var vm = this;


  }
})();
