var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

var rooms = ['Room 1', 'Room 2', 'Room 3'];
var users = {};

io.use((socket, next) => {
  next();
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  users[socket.id] = socket.handshake.query.userSid;
  console.log(`connected: ${socket.id} (AKA '${users[socket.id]}')`);

  socket.broadcast.emit('user:connect', {
    user: users[socket.id]
  });

  socket.emit('welcome', {
    users: Object.keys(users).map(x => users[x]),
    rooms
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
