var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.render(`${__dirname}/public/index`);
});

app.get('/views/:name', (req, res) => {
  res.render(`${__dirname}/public/views/${req.params.name}`);
});

var rooms = ['room1', 'room2', 'room3'];
var nextUsername = 1;
var users = {};

io.use((socket, next) => {
  var userSid = socket.handshake.query.userSid;

  if (!userSid || !findUserBySid(userSid)) {
    var newUser = {
      userSid: crypto.createHash('md5').update(new Date().toString()),
      username: getNextUsername()
    };
    users[socket.id] = newUser;
  }
  next();
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  console.log(`connected: ${socket.id} (AKA '${users[socket.id].username}')`);

  socket.broadcast.emit('user:connect', {
    user: users[socket.id].username
  });

  socket.on('conn', (data, callback) => {
    callback({
      userSid: users[socket.id].userSid,
      username: users[socket.id].username,
      users: Object.keys(users).map(x => users[x].username),
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

    delete users[socket.id];
    console.log(`disconnected: ${socket.id}`);
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});

function findUserBySid(userSid) {
  for (var id in users) {
    if (users[id].userSid === userSid)
      return users[id];
  }
  return null;
}

function getNextUsername() {
  return 'Guest ' + nextUsername++ % 100;
}
