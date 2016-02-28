class NavController {
  constructor($uibModal, toastr, userService) {
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
      controller: ['$scope', '$uibModalInstance', 'username', function ($scope, theModal, username) {
        $scope.newUsername = username;
        $scope.save = () => { theModal.close($scope.newUsername); };
        $scope.cancel = () => { theModal.dismiss('cancel'); };
      }],
      resolve: {
        username: () => this.username
      }
    });

    theModal.result.then(newUsername => {
      this.username = newUsername;
    }, reason => {
        this.toastr.warning('Username was not changed...');
    });
  }

  _setup () {
    this.username = this.userService.username;
  }
}

NavController.$inject = ['$uibModal', 'toastr', 'userService'];

export { NavController };
