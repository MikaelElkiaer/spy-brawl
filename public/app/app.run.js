function run (socket, userService) {
  socket.connect(userService.userSid);
}

run.$inject = ['socketService', 'userService'];

export { run }
