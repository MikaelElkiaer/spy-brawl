function handle(io, socket, users, rooms, idGenerator, User, Room) {
  const ROOM_ID_SIZE = 5;

  socket.on('join', (data, callback) => {
    var room = rooms.getRoomById(data.roomId);
    if (!room) {
      callback(null, 'Room doesn\'t exist');
      return;
    }
    socket.join(data.roomId);

    var user = users.getUserById(socket.id);

    if (!room.getUserByPid(user.pid)) {
      room.addUser(user.pid, user);
    }

    callback(room.getAll());

    socket.broadcast.to(data.roomId).emit('user:join', room.getUserByPid(user.pid).public);
  });

  socket.on('msg', (data, callback) => {
    io.in(data.roomId).emit('user:msg', { chatMsg: data.chatMsg });
    callback();
  });

  socket.on('create-room', (data, callback) => {
    var user = users.getUserById(socket.id);
    var roomId = idGenerator.generate(null, ROOM_ID_SIZE);

    rooms.addRoom(roomId, new Room(user.pid, user));
    callback({ roomId });
  });
}

module.exports = handle;
