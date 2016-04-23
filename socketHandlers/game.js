var Stopwatch = require('timer-stopwatch');

function handle(io, socket, users, rooms, idGenerator, User, Room) {
  const DEFAULT_GAME_TIME = 8 * 60000; // 8 minutes in ms

  // TODO: We should probably figure out a better way to store the various
  //       locations and roles rather than directly in the code.
  var locations = {
    airplane: {
      roles: ['1st Class Passenger',
              'Air Marshal',
              'Mechanic',
              'Coach Passenger',
              'Flight Attendant',
              'Co-Pilot',
              'Captain']
    }
  };

  socket.on('startgame', (data, callback) => {
    var maybeHost = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    if (!room.getUserByPid(maybeHost.pid).isHost) {
      callback(null, 'Only the host can start the game');
      return;
    }

    for (var pid in room._users) {
      if (!room._users[pid].ready) {
        callback(pid, 'Not all users are ready');
        return;
      }
    }

    io.in(data.roomId).clients((error, clients) => {
      var locationKeys = Object.keys(locations);
      var location = locationKeys[locationKeys.length * Math.random() << 0];
      var roles = JSON.parse(JSON.stringify(locations[location].roles));
      var role = '';
      room.location = location;

      var clientCount = clients.length;
      for (var i = 0; i < clientCount; i++) {
        var clientId = clients.splice(clients.length * Math.random() << 0, 1)[0];
        var user = users.getUserById(clientId);
        if (i === 0) {
          role = 'Spy';
          io.in(clientId).emit('user:role', {role: role,
                                             location: 'Unknown'});
          room.spy = user.pid;
        } else {
          role = roles.splice(roles.length * Math.random() << 0, 1)[0];
          io.in(clientId).emit('user:role', {role: role,
                                             location: location});
        }
        room.getUserByPid(user.pid).role = role;
      }
    });

    room.startTime = new Date();
    room.endTime = new Date(room.startTime.getTime() + 8*60000);
    var timer = new Stopwatch(DEFAULT_GAME_TIME);
    timer.onDone( () => {
      // Game Over
    });
    timer.start();
    room.timer = timer;
    room.state = 'main';

    io.to(data.roomId).emit('user:startgame', { startTime: room.startTime,
                                                endTime: room.endTime
                                              });
  });

  socket.on('pause', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    var roomUser = room.getUserByPid(user.pid);

    if (room.state !== 'main') {
      callback(null, 'Cannot pause at this time');
      return;
    }

    if (roomUser.role === 'Spy' && !data.intent) {
      callback({ isSpy: true });
      return;
    }
    room.timer.stop();
    room.state = 'paused';

    if (data.intent === 'guessLocation') {
      if (roomUser.role !== 'Spy') {
        callback(null, 'Only spies can attempt to guess the location');
        return;
      }
      socket.to(data.roomId).broadcast.emit('user:waitforlocation', {userPid: user.pid});
      io.to(socket.id).emit('spy:guesslocation', {locations: Object.keys(locations)});
    } else {
      socket.to(data.roomId).broadcast.emit('user:waitforaccusation', {userPid: user.pid});
      io.to(socket.id).emit('user:accuse', null);
    }
  });

  socket.on('guessLocation', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    var roomUser = room.getUserByPid(user.pid);

    if (roomUser.role !== 'Spy') {
      callback(null, 'Only spies can attempt to guess the location');
      return;
    }

    if (room.location === data.location){
      io.to(socket.id).emit('user:gameover', {didWin: true,
                                              condition: 'location',
                                              guess: data.location,
                                              actualLocation: room.location,
                                              spyPid: user.pid});
      socket.to(data.roomId).broadcast.emit('user:gameover', {didWin: false,
                                                              condition: 'location',
                                                              guess: data.location,
                                                              actualLocation: room.location,
                                                              spyPid: user.pid});
    } else {
      io.to(socket.id).emit('user:gameover', {didWin: false,
                                              condition: 'location',
                                              guess: data.location,
                                              actualLocation: room.location,
                                              spyPid: user.pid});
      socket.to(data.roomId).broadcast.emit('user:gameover', {didWin: true,
                                                              condition: 'location',
                                                              guess: data.location,
                                                              actualLocation: room.location,
                                                              spyPid: user.pid});
    }
  });

  socket.on('accuse', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    var roomUser = room.getUserByPid(user.pid);

    room.votes = [];
    io.in(data.roomId).clients((error, clients) => {
      for (var client in clients) {
        var u = users.getUserById(clients[client]);
        if (u.pid === data.userPid) {
          room.suspect = u;
          io.to(clients[client]).emit('user:waitforvote', {suspectPid: data.userPid,
                                                           accuserPid: user.pid});
        } else {
          io.to(clients[client]).emit('user:vote', {suspectPid: data.userPid,
                                                    accuserPid: user.pid});
        }
      }
    });
  });

  socket.on('vote', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    var roomUser = room.getUserByPid(user.pid);

    // TODO doesn't seem like the following is implemented frontend: io.to(data.roomId).emit('user:voteupdated', { user: users[socket.id].username });
    callback(null);
    room.votes.push(data.vote);

    if (room.votes.length === Object.keys(room._users).length - 1) {
      // Determine whether a majority of votes was yes or no
      var yesCount = 0;
      var noCount = 0;
      for (var vote in room.votes) {
        if (room.votes[vote] === 'yes'){
          yesCount++;
        } else {
          noCount++;
        }
      }
      if (yesCount > noCount) {
        var suspect = room.suspect;
        var isSuspectSpy = room.spy === suspect.pid;

        io.in(data.roomId).clients((error, clients) => {
          for (var client in clients) {
            var u = users.getUserById(clients[client]);
            io.to(clients[client]).emit('user:gameover', {didWin: ((u.pid !== suspect.pid && isSuspectSpy) || (!isSuspectSpy && u.pid === room.spy)),
                                                          condition: 'accusation',
                                                          suspectPid: user.pid,
                                                          spyPid: room.spy});
          }
        });
      } else {
        room.suspect = undefined;
        io.in(data.roomId).emit('user:resume', undefined);
        room.state = 'main';
        room.timer.start();
      }
    }
  });

  socket.on('toggleready', data => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.roomId);
    var roomUser = room.getUserByPid(user.pid);
    var isReady = !roomUser.ready;
    roomUser.ready = isReady;

    io.in(data.roomId).emit('user:toggleready', {
      userPid: roomUser.user.pid,
      isReady: isReady
    });
  });
}

module.exports = handle;
