var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use(require('connect-livereload')({
  port: 35729
}));

app.get('/', (req, res) => {
  res.render(`${__dirname}/public/index`);
});

app.get('/views/:name', (req, res) => {
  res.render(`${__dirname}/public/views/${req.params.name}`);
});

const ROOM_ID_SIZE = 5;
var rooms = {};
var nextUsername = 1;
var users = {};

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

io.use((socket, next) => {
  var userSid = socket.handshake.query.userSid;
  if (!userSid || !findUserBySid(userSid)) {
    var newUser = {
      userSid: crypto.createHash('md5').update(new Date().toString()).digest('hex'),
      username: getNextUsername(),
      active: true
    };
    users[socket.id] = newUser;
  }
  else {
    var oldUser = findUserBySid(userSid);
    delete users[oldUser.userSid];
    oldUser.userObj.active = true;
    users[socket.id] = oldUser.userObj;
  }
  next();
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  socket.broadcast.emit('user:connect', {
    user: users[socket.id].username
  });

  socket.on('conn', (data, callback) => {
    callback({
      userSid: users[socket.id].userSid,
      username: users[socket.id].username
    });
  });

  socket.on('home', (data, callback) => {
    callback({
      users: Object.keys(users).filter(x => users[x].active).map(x => users[x].username),
      rooms
    });
  });

  socket.on('join', (data, callback) => {
    if (!rooms[data.roomId]) {
      callback(null, 'Room doesn\'t exist');
      return;
    }
    socket.join(data.roomId);
    rooms[data.roomId].users[users[socket.id].username] = false;

    io.in(data.roomId).clients((error, clients) => {
      callback({ isHost: (socket.id === rooms[data.roomId].host),
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
    socket.broadcast.emit('user:disconnect', {
        user: users[socket.id].username
    });

    var username = users[socket.id].username;
    Object.keys(rooms).forEach(x => {
      var cur = rooms[x].users;
      if (cur[username] !== undefined)
        delete cur[username];
      });

    users[socket.id].active = false;
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

  socket.on('startgame', data => {
    if (socket.id !== rooms[data.roomId].host) {
      return;
    }

    io.in(data.roomId).clients((error, clients) => {
      var locationKeys = Object.keys(locations);
      var location = locationKeys[locationKeys.length * Math.random() << 0];
      var roles = JSON.parse(JSON.stringify(locations[location].roles));
      var role = '';
      rooms[data.roomId].location = location;

      for (var i = 0; i <= clients.length; i++) {
        var clientId = clients.splice(clients.length * Math.random() << 0, 1)[0];
        if (i === 0) {
          role = 'Spy';
          io.in(clientId).emit('user:role', {role: role,
                                             location: 'Unknown'});
        } else {
          role = roles.splice(roles.length * Math.random() << 0, 1)[0];
          io.in(clientId).emit('user:role', {role: role,
                                             location: location});
        }
        users[clientId].role = role;
      }
    });
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
    var oldUsername = users[socket.id].username;
    var newUsername = data.newUsername;
    if (_isValidUsername(newUsername)) {
      users[socket.id].username = newUsername;
      callback({ newUsername });
      io.emit('user:change-username', {
        oldUsername,
        newUsername
      });
    }
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});

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
