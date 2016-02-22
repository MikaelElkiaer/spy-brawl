function run (socket, userService) {
  console.log(`current user: ${userService.userSid}`);
  socket.connect(userService.userSid);
}

run.$inject = ['socketService', 'userService'];

export { run }
