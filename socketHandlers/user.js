function handle(io, socket, users, rooms, idGenerator, User) {
  socket.broadcast.emit('user:connect', users.getUserById(socket.id).public);

  socket.on('conn', (data, callback) => {
    var user = users.getUserById(socket.id);
    callback({
      userSid: user.sid,
      username: user.username
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user:disconnect', users.getUserById(socket.id).public);

    var username = users.getUserById(socket.id).username;
    Object.keys(rooms).forEach(x => {
      var cur = rooms[x].users;
      if (cur[username] !== undefined)
        delete cur[username];
      });

    users.getUserById(socket.id).active = false;
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
