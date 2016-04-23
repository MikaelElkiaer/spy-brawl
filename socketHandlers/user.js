var User = require('../model/user').User;

function handle(io, socket, users, rooms) {
  socket.broadcast.emit('user:connect', users.getUserById(socket.id).public);

  socket.on('conn', (data, callback) => {
    var user = users.getUserById(socket.id);
    callback({
      userSid: user.sid,
      userPid: user.pid,
      username: user.username
    });
  });

  socket.on('disconnect', () => {
    var user = users.getUserById(socket.id);
    user.active = false;
    socket.broadcast.emit('user:disconnect', user.public);
  });

  socket.on('home', (data, callback) => {
    callback({ users: users.getAll() });
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
        username: newUsername
      });
    }
    else
      callback({ error: `The new username ${newUSername} is not allowed.`});
  });
}

module.exports = handle;
