function run (socket) {
  socket.connect(Math.ceil(Math.random() * 1000));
}

run.$inject = ['socketService'];

export { run }
