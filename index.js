var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Stopwatch = require('timer-stopwatch');

var User = require('./model/user').User;
var UserCollection = require('./model/user').UserCollection;
var Room = require('./model/room').Room;
var RoomCollection = require('./model/room').RoomCollection;
var IdGenerator = require('./model/idGenerator');

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
var idGenerator = new IdGenerator(require('crypto'));

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
  else
    users.changeId(sid, socket.id, true);

  next();
});

// fire up socket handlers
io.on('connection', socket => {
  require('./socketHandlers/user')(io, socket, users, rooms, locations, idGenerator, User, Room);
  require('./socketHandlers/room')(io, socket, users, rooms, locations, idGenerator, User, Room);
  require('./socketHandlers/game')(io, socket, users, rooms, locations, idGenerator, User, Room);
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));
