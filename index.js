var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use('/public', express.static('public'));
app.use('/bower_components', express.static('bower_components'));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', socket => {
  socket.clientIp = socket.request.connection.remoteAddress;

  console.log(`connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);
  });
});

http.listen(app.get('port'), () => {
  console.log(`listening on *:${app.get('port')}`);
});
