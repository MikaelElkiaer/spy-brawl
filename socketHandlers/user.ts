import { User, UserCollection } from '../model/user';

function handle(io, socket, users: UserCollection, rooms) {
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

  socket.on('home', (data, callback: (data?: any, error?: string) => any) => {
    callback({ users: users.getAll() });
  });

  socket.on('change-username', (data, callback) => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.username;
    var newUsername = data.newUsername;

    if (User.isValidUsername(newUsername, users)) {
      user.username = newUsername;

      callback(null, { newUsername });

      io.emit('user:change-username', {
        pid: user.pid,
        username: newUsername
      });
    }
    else
      callback(`The new username ${newUsername} is not allowed.`);
  });
}

module.exports = handle;
