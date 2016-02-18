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

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  users[socket.id] = null;
  console.log(`connected: ${socket.id}`);

  socket.on('disconnect', () => {
    delete users[socket.id];
    console.log(`disconnected: ${socket.id}`);
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});
