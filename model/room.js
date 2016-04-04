class Room {
  constructor(hostId, user) {
    this._users = {};
    this._users[hostId] = { user: user, ready: false, host: true };
  }

  get users() { return this._users; }
  get host() { return this._host; }

  addUser(id, user) { this._users[id] = { user: user, ready: false, host: false }; }
  removeUser(id) { delete this._users[id]; }

  getUserById(id) {
    var user = this._users[id];
    if (!user)
      return user;

    return { user: user.user.public, ready: user.ready, host: user.host };
  }

  getAll() {
    var result = {};
    Object.keys(this._users).forEach(id => {
      var user = this.getUserById(id);
      result[user.user.pid] = user;
    });
    return result;
  }
}

module.exports = Room;
