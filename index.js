var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');
var Stopwatch = require('timer-stopwatch');
var User = require('./model/user');
var UserCollection = require('./model/userCollection');
var Room = require('./model/room');
var RoomCollection = require('./model/roomCollection');
var IdGenerator = require('./model/idGenerator');

// TODO Remove before deploying
app.use(require('connect-livereload')({ port: 35729 }));

// Setup of server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.get('/', (req, res) => { res.render(`${__dirname}/public/index`); });
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/public/views/${req.params.name}`); });
if (process.env.NPM_CONFIG_PRODUCTION === 'false')
  app.use(require('connect-livereload')({ port: 35729 }));

const ROOM_ID_SIZE = 5;
const DEFAULT_GAME_TIME = 8 * 60000; // 8 minutes in ms
var rooms = {};
var nextUsername = 1;
var users = new UserCollection();
var idGenerator = new IdGenerator(crypto);

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

// create new user if needed, otherwise change id for existing user
io.use((socket, next) => {
  var sid = socket.handshake.query.userSid;

  if (!sid || !users.getUserBySid(sid))
    users.addUser(socket.id, new User(idGenerator));
  else {
    users.changeId(sid, socket.id);
    users.getUserById(socket.id).active = true;
  }

  next();
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

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
      users: users.getAll(),
      rooms
    });
  });

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

  socket.on('startgame', (data, callback) => {
    if (socket.id !== rooms[data.roomId].host) {
      callback(null, 'Only the host can start the game');
      return;
    }

    for (var u in rooms[data.roomId].users) {
      if (!rooms[data.roomId].users[u]) {
        callback(u, 'Not all users are ready');
        return;
      }
    }

    io.in(data.roomId).clients((error, clients) => {
      var locationKeys = Object.keys(locations);
      var location = locationKeys[locationKeys.length * Math.random() << 0];
      var roles = JSON.parse(JSON.stringify(locations[location].roles));
      var role = '';
      rooms[data.roomId].location = location;

      var clientCount = clients.length;
      for (var i = 0; i < clientCount; i++) {
        var clientId = clients.splice(clients.length * Math.random() << 0, 1)[0];
        if (i === 0) {
          role = 'Spy';
          io.in(clientId).emit('user:role', {role: role,
                                             location: 'Unknown'});
          rooms[data.roomId].spy = clientId;
        } else {
          role = roles.splice(roles.length * Math.random() << 0, 1)[0];
          io.in(clientId).emit('user:role', {role: role,
                                             location: location});
        }
        users[clientId].role = role;
      }
    });

    rooms[data.roomId].startTime = new Date();
    rooms[data.roomId].endTime = new Date(rooms[data.roomId].startTime.getTime() + 8*60000);
    var timer = new Stopwatch(DEFAULT_GAME_TIME);
    timer.onDone( () => {
      // Game Over
    });
    timer.start();
    rooms[data.roomId].timer = timer;
    rooms[data.roomId].state = 'main';

    io.to(data.roomId).emit('user:startgame', { startTime: rooms[data.roomId].startTime,
                                                endTime: rooms[data.roomId].endTime
                                              });
  });

  socket.on('pause', (data, callback) => {
    var room = rooms[data.roomId];

    if (room.state !== 'main') {
      callback(null, 'Cannot pause at this time');
      return;
    }

    if (users[socket.id].role === 'Spy' && !data.intent) {
      callback({ isSpy: true });
      return;
    }
    room.timer.stop();
    room.state = 'paused';

    if (data.intent === 'guessLocation') {
      if (users[socket.id].role !== 'Spy') {
        callback(null, 'Only spies can attempt to guess the location');
        return;
      }
      socket.to(data.roomId).broadcast.emit('user:waitforlocation', {user: users[socket.id].username});
      io.to(socket.id).emit('spy:guesslocation', {locations: Object.keys(locations)});
    } else {
      socket.to(data.roomId).broadcast.emit('user:waitforaccusation', {user: users[socket.id].username});
      io.to(socket.id).emit('user:accuse', null);
    }
  });

  socket.on('guessLocation', (data, callback) => {
    if (users[socket.id].role !== 'Spy') {
      callback(null, 'Only spies can attempt to guess the location');
      return;
    }

    if (rooms[data.roomId].location === data.location){
      io.to(socket.id).emit('user:gameover', {didWin: true,
                                              condition: 'location',
                                              guess: data.location,
                                              actualLocation: rooms[data.roomId].location,
                                              spy: users[socket.id].username});
      socket.to(data.roomId).broadcast.emit('user:gameover', {didWin: false,
                                                              condition: 'location',
                                                              guess: data.location,
                                                              actualLocation: rooms[data.roomId].location,
                                                              spy: users[socket.id].username});
    } else {
      io.to(socket.id).emit('user:gameover', {didWin: false,
                                              condition: 'location',
                                              guess: data.location,
                                              actualLocation: rooms[data.roomId].location,
                                              spy: users[socket.id].username});
      socket.to(data.roomId).broadcast.emit('user:gameover', {didWin: true,
                                                              condition: 'location',
                                                              guess: data.location,
                                                              actualLocation: rooms[data.roomId].location,
                                                              spy: users[socket.id].username});
    }
  });

  socket.on('accuse', (data, callback) => {
    rooms[data.roomId].votes = [];
    io.in(data.roomId).clients((error, clients) => {
      for (var client in clients) {
        if (users[clients[client]].username === data.user) {
          rooms[data.roomId].suspect = clients[client];
          io.to(clients[client]).emit('user:waitforvote', {suspect: data.user,
                                                           accuser: users[socket.id].username});
        } else {
          io.to(clients[client]).emit('user:vote', {suspect: data.user,
                                                    accuser: users[socket.id].username});
        }
      }
    });
  });

  socket.on('vote', (data, callback) => {
    io.to(data.roomId).emit('user:voteupdated', { user: users[socket.id].username });
    callback(null);
    rooms[data.roomId].votes.push(data.vote);

    if (rooms[data.roomId].votes.length === Object.keys(rooms[data.roomId].users).length - 1) {
      // Determine whether a majority of votes was yes or no
      var yesCount = 0;
      var noCount = 0;
      for (var vote in rooms[data.roomId].votes) {
        if (rooms[data.roomId].votes[vote] === 'yes'){
          yesCount++;
        } else {
          noCount++;
        }
      }
      if (yesCount > noCount) {
        var suspect = rooms[data.roomId].suspect;
        var isSuspectSpy = rooms[data.roomId].spy === suspect;

        io.in(data.roomId).clients((error, clients) => {
          for (var client in clients) {
            io.to(clients[client]).emit('user:gameover', {didWin: ((clients[client] !== suspect && isSuspectSpy) || (!isSuspectSpy && clients[client] === rooms[data.roomId].spy)),
                                                          condition: 'accusation',
                                                          suspect: users[suspect].username,
                                                          spy: users[rooms[data.roomId].spy].username});
          }
        });
      } else {
        rooms[data.roomId].suspect = undefined;
        io.in(data.roomId).emit('user:resume', undefined);
        rooms[data.roomId].state = 'main';
        rooms[data.roomId].timer.start();
      }
    }
  });

  socket.on('toggleready', data => {
    var username = users[socket.id].username;
    var isReady = rooms[data.roomId].users[username];
    isReady = !isReady;
    rooms[data.roomId].users[users[socket.id].username] = isReady;
    io.in(data.roomId).emit('user:toggleready', {
      user: username,
      isReady: isReady
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
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

function _createRoomId() {
  return crypto.createHash('md5').update(new Date().toString()).digest('hex').substring(0, ROOM_ID_SIZE);
}

function findUserBySid(userSid) {
  var socketIds = Object.keys(users);
  for (var i = 0; i < socketIds.length; i++) {
    var id = socketIds[i];
    if (users[id].userSid === userSid)
      return { userSid: id, userObj: users[id] };
  }
  return null;
}

function getNextUsername() {
  return 'Guest ' + nextUsername++ % 100;
}

function _isValidUsername(username) {
  return true;
}
