class RoomController {
  constructor($state, params, toastr, socket, userService, $uibModal) {
    this.$state = $state;
    this.toastr = toastr;
    this.socket = socket;
    this.userService = userService;
    this.roomId = params.roomId;
    this.$modal = $uibModal;

    this.messages = [];
    this._setup(this.roomId);
  }

  sendMessage() {
    this.socket.emit('msg', {
      roomId: this.roomId,
      chatMsg: this.chatMsg
    }, data => {

    });
    this.chatMsg = '';
  }

  startGame() {
    this.socket.emit('startgame', { roomId: this.roomId }, (data, error) => {
      if (error) {
        this.toastr.warning(error);
      }
    });
  }
  
  pause(intent) {
    this.socket.emit('pause', { roomId: this.roomId, intent: intent }, (data, error) => {
      if (error) {
        this.toastr.error(error);
      } else {
        if (data.isSpy) {
          var theModal = this.$modal.open({
              animation: true,
              size: 'sm',
              templateUrl: '/views/select-pause-action-modal',
              controller: roomModalController,
              resolve: {
                roomId: () => {return this.roomId},
                users: () => {return this.users},
                locations: () => {return this.locations}
              }
          });
        }
      }
    });
  }

  toggleReady() {
    this.socket.emit('toggleready', {
      roomId: this.roomId
    });
  }

  vote(vote) {
    this.socket.emit('vote', {roomId: this.roomId, vote}, (data, error) => {
      if (error) {
        this.toastr.error(error);
      } else {
        this.isVoting = false;
      }
    });
  }

  _setup(roomId) {
    this.log = angular.element(document.querySelector('#chatLog'));

    this.socket.emit('join', { roomId }, (data, error) => {
      if (error) {
        this.toastr.error(error);
        this.$state.go('home');
      }
      else {
        this.users = data.users;
        this.isHost = data.isHost;
        this.host = data.host
      }
    });

    this.socket.on('user:join', data => {
      this.users[data.user] = false;
    });

    this.socket.on('user:disconnect', data => {
      delete this.users[data.user];
    });

    this.socket.on('user:msg', data => {
      this.messages.push(data.chatMsg);
    });

    this.socket.on('user:change-username', data => {
      this.users[data.newUsername] = this.users[data.oldUsername];
      delete this.users[data.oldUsername];
    });
    
    this.socket.on('user:toggleready', data => {
      this.users[data.user] = data.isReady;
    });

    this.socket.on('user:startgame', data => {
      this.startTime = data.startTime;
      this.endTime = data.endTime;
      this.isPaused = false;
      this.isStarted = true;
    });

    // Players are waiting for the spy to select a location
    this.socket.on('user:waitforlocation', data => {
      this.isPaused = true;
      this.pauseSliderClass = 'bg-warning';
      this.pauseReason = 'Waiting for ' + data.user + ' to select a location.';
    });

    // Spy is asked to select a location
    this.socket.on('spy:guesslocation', data => {
      this.isPaused = true;
      this.locations = data.locations;
      var theModal = this.$modal.open({
          animation: true,
          size: 'sm',
          templateUrl: '/views/guess-location-modal',
          controller: roomModalController,
          resolve: {
            roomId: () => {return this.roomId},
            users: () => {return this.users},
            locations: () => {return this.locations}
          },
          backdrop: 'static',
          keyboard: false
      });
    });

    // Players are waiting for the player who paused to select a player
    this.socket.on('user:waitforaccusation', data => {
      this.isPaused = true;
      this.pauseSliderClass = 'bg-info';
      this.pauseReason = 'Waiting for ' + data.user + ' to select a player';
    });

    // The player who paused is asked to select a player
    this.socket.on('user:accuse', data => {
      this.isPaused = true;
      var theModal = this.$modal.open({
          animation: true,
          size: 'sm',
          templateUrl: '/views/accuse-modal',
          controller: roomModalController,
          resolve: {
            roomId: () => {return this.roomId},
            users: () => {return this.users},
            locations: () => {return this.locations}
          },
        backdrop: 'static',
        keyboard: false
      });
    });

    this.socket.on('user:gameover', data => {
      this.gameOver = true;
      this.didWin = data.didWin;
      this.gameOverPanelClass = (this.didWin) ? 'panel-success' : 'panel-danger';
      this.gameOverPanelTitle = (this.didWin) ? 'You Won' : 'You Lost';
      if (data.condition === 'location') {
        if (data.spy === this.userService.username) {
          this.gameOverPanelBodyText = (this.didWin) ? data.guess + ' was correct! How did you know?' : 'Unfortunately ' + data.guess + ' was not it. Did you not get the hints? It was obviously ' + data.actualLocation;
        } else {
          this.gameOverPanelBodyText = (this.didWin) ? data.spy + ' thought it was ' + data.guess + ', what a dimwit!' : data.spy + ' correctly guessed the location. How could you just give it away like that?';
        }
      } else {
        // Accusation gameover messages
        if (data.spy === this.userService.username) {
          this.gameOverPanelBodyText = (this.didWin) ? data.suspect + ' has been arrested for spying! Good job on not blowing your cover, but you should proabably get out of here soon.' : 'You have been compromised! Your days of spying are over!';
        } else {
          if (data.suspect === this.userService.username && !this.didWin) {
            this.gameOverPanelBodyText = data.spy + ' laughs as you are being arrested for spying. How are they not seeing that he is the real spy?';
          } else {
            this.gameOverPanelBodyText = (this.didWin) ? data.spy + ' has been arrested for spying! Good job exposing him!' : data.suspect + ' has been arrested for spying! Minor thing though.. it was actually ' + data.spy + ' who was the real spy.';
          }
        }
      }
    });

    this.socket.on('user:waitforvote', data => {
      this.pauseSliderClass = 'bg-warning';
      this.pauseReason = data.accuser + ' accused you of being the spy! People are voting on it now..';
    });

    this.socket.on('user:vote', data => {
      this.isVoting = true;
    });
  }
}

RoomController.$inject = ['$state', '$stateParams', 'toastr', 'socketService', 'userService', '$uibModal'];


roomModalController.$inject = ['$scope', '$uibModalInstance', 'socketService', 'userService', 'roomId', 'users', 'locations'];
function roomModalController ($scope, theModal, socket, userService, roomId, users, locations) {
  $scope.userService = userService;
  $scope.selectAccuseAction = selectAccuseAction;
  $scope.selectGuessLocationAction = selectGuessLocationAction;
  $scope.accuse = accuse;
  $scope.guessLocation = guessLocation;
  $scope.users = users;
  $scope.locations = locations;

  function selectAccuseAction() {
    socket.emit('pause', { roomId: roomId, intent: 'accuse'}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      }
    });
    theModal.close();
  }

  function selectGuessLocationAction() {
    socket.emit('pause', { roomId: roomId, intent: 'guessLocation'}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      }
    });
    theModal.close();
  }

  function accuse(user) {
    socket.emit('accuse', {roomId, user}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      }
    });
    theModal.close();
  }

  function guessLocation(location) {
    socket.emit('guessLocation', {roomId, location}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      }
    });
    theModal.close();
  }
}

export { RoomController };
