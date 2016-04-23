var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var User = require('./model/user').User;
var UserCollection = require('./model/user').UserCollection;
var RoomCollection = require('./model/room').RoomCollection;

// Setup of server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.get('/', (req, res) => { res.render(`${__dirname}/public/index`); });
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/public/views/${req.params.name}`); });
if (!process.env.NPM_CONFIG_PRODUCTION)
  app.use(require('connect-livereload')({ port: 35729 }));

var rooms = new RoomCollection();
var users = new UserCollection();

// create new user if needed, otherwise change id for existing user
io.use((socket, next) => {
  var sid = socket.handshake.query.userSid;

  if (!sid || !users.getUserBySid(sid))
    users.addUser(socket.id, new User());
  else
    users.changeId(sid, socket.id, true);

  next();
});

// fire up socket handlers
io.on('connection', socket => {
  require('./socketHandlers/user')(io, socket, users, rooms);
  require('./socketHandlers/room')(io, socket, users, rooms);
  require('./socketHandlers/game')(io, socket, users, rooms);
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));
