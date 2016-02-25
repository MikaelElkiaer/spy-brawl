var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.get('/', (req, res) => {
  res.render(`${__dirname}/public/index`);
});

app.get('/views/:name', (req, res) => {
  res.render(`${__dirname}/public/views/${req.params.name}`);
});

var rooms = [];
var nextRoomId = 1;
var nextUsername = 1;
var users = {};

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
      username: users[socket.id].username,
      users: Object.keys(users).filter(x => users[x].active).map(x => users[x].username),
      rooms
    });
  });

  socket.on('join', (data, callback) => {
    socket.join(data.roomId);

    io.in(data.roomId).clients((error, clients) => {
      callback({ users: clients.map(c => users[c].username) });
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

    users[socket.id].active = false;
  });
  
  socket.on('create-room', data => {
    rooms.push(nextRoomId);
    nextRoomId++;
    socket.broadcast.emit('user:create-room', {
      rooms: rooms
    })
    socket.emit('user:create-room', {
      rooms: rooms
    });
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});

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
