class NavController {
  constructor($scope, $uibModal, toastr, userService) {
    this.$scope = $scope;
    this.$modal = $uibModal;
    this.toastr = toastr;
    this.userService = userService;

    this._setup();
  }

  changeUsernameModal() {
    var theModal = this.$modal.open({
      animation: true,
      size: 'sm',
      templateUrl: '/views/change-username-modal',
      controller: changeUsernameController,
      resolve: {
        username: () => this.username
      }
    });

    theModal.result.then(newUsername => {
      this.username = newUsername;
      this.userService.username = newUsername;
    }, reason => {
        this.toastr.warning('Username was not changed...');
    });
  }

  _setup () {
    this.$scope.$watch(() => this.userService.username, (oldVal, newVal) => {
      this.username = this.userService.username;
    });
  }
}

changeUsernameController.$inject = ['$scope', '$uibModalInstance', 'socketService', 'username'];
function changeUsernameController ($scope, theModal, socket, username) {
  $scope.newUsername = username;
  $scope.save = save;
  $scope.cancel = () => { theModal.dismiss('cancel'); };

  function save() {
    socket.emit('change-username', { newUsername: $scope.newUsername }, (data, error) => {
      if (error)
        theModal.dismiss('error');
      else
        theModal.close(data.newUsername);
    });
  }
}

NavController.$inject = ['$scope', '$uibModal', 'toastr', 'userService'];
export { NavController };
