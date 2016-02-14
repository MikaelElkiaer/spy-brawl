class SocketController {

  constructor(socketService) {
    this.socketService = socketService;
  }

}

SocketController.$inject = ['socketService']

export { SocketController }
