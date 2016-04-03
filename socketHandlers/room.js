function handle(io, socket, users, rooms, idGenerator, User) {
  socket.on('join', (data, callback) => {
    if (!rooms[data.roomId]) {
      callback(null, 'Room doesn\'t exist');
      return;
    }
    socket.join(data.roomId);

    var isHost = (socket.id === rooms[data.roomId].host);
    rooms[data.roomId].users[users[socket.id].username] = isHost;

    io.in(data.roomId).clients((error, clients) => {
      callback({ isHost: isHost,
                 host: users[rooms[data.roomId].host].username,
                 users: rooms[data.roomId].users
               });
    });

    socket.broadcast.to(data.roomId).emit('user:join', {
      user: users[socket.id].username
    });
  });

  socket.on('msg', (data, callback) => {
    io.in(data.roomId).emit('user:msg', { chatMsg: data.chatMsg });
    callback();
  });

  socket.on('create-room', (data, callback) => {
    var roomId = _createRoomId();
    rooms[roomId] = {
      host: socket.id,
      users: {
        [users[socket.id].username]: false
      }
    };
    callback({ roomId });
  });
}

module.exports = handle;
