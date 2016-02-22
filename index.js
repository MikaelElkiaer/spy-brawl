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

var rooms = ['Room 1', 'Room 2', 'Room 3'];
var users = {};
var usernames = {};

io.use((socket, next) => {
  var userSid = socket.handshake.query.userSid;

  if (!userSid) {
    var username = socket.handshake.query.username;
    if (username) {
      var hash = crypto.createHash('md5').update(new Date().toString());
      usernames[hash] = username;
    }
    else
      next(new Error({ code: 1 }));
  }
  else if (!usernames[userSid])
    next(new Error({ code: 2 }));
  else
    next();
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  users[socket.id] = usernames[socket.handshake.query.userSid];
  console.log(`connected: ${socket.id} (AKA '${users[socket.id]}')`);

  socket.broadcast.emit('user:connect', {
    user: users[socket.id]
  });

  socket.on('conn', (data, callback) => {
    callback({
      username: users[socket.id],
      users: Object.keys(users).map(x => users[x]),
      rooms
    });
  });

  socket.on('join', (data, callback) => {
    socket.join(data.roomId);

    io.in(data.roomId).clients((error, clients) => {
      callback({ users: clients.map(c => users[c]) });
    });

    socket.broadcast.to(data.roomId).emit('user:join', {
      user: users[socket.id]
    });
  });

  socket.on('msg', (data, callback) => {
    io.in(data.roomId).emit('user:msg', { chatMsg: data.chatMsg });
    callback();
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user:disconnect', {
        user: users[socket.id]
    });

    delete users[socket.id];
    console.log(`disconnected: ${socket.id}`);
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});
