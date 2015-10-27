var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/bower_components', express.static('bower_components'));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  console.log(`connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);
  });
});

http.listen(80, () => {
  console.log('listening on *:80');
});
