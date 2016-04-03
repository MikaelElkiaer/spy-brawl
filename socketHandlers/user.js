function handle(io, socket, users, User) {
  socket.broadcast.emit('user:connect', users.getUserById(socket.id).public);

  socket.on('conn', (data, callback) => {
    var user = users.getUserById(socket.id);
    callback({
      userSid: user.sid,
      username: user.username
    });
  });

  socket.on('home', (data, callback) => {
    callback({
      users: users.getAll()
    });
  });

  socket.on('change-username', (data, callback) => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.username;
    var newUsername = data.newUsername;
    if (User.isValidUsername(newUsername)) {
      user.username = newUsername;
      callback({ newUsername });
      io.emit('user:change-username', {
        pid: user.pid,
        username: user.username
      });
    }
  });
}

module.exports = handle;
