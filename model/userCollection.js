class UserCollection {
  constructor () {
    this._users = {};
  }

  get users() { return Object.keys(this._users).map(k => {
      var user = this._users[k];
      return {
        pid: user.pid,
        username: user.username,
        active: user.active
      };
    });
  }

  get activeUsers() { return this.users.filter(u => u.active); }

  addUser(id, user) {
    if (!this._users[id])
      this._users[id] = user;
    else
      throw `User with id ${id} already in userCollection.`;
  }

  removeUser(id) {
    if (this._users[id])
      delete this._users[id];
    else
      throw `User with id ${id} not in userCollection.`;
  }

  changeId(sid, id) {
    var user = this.getUserBySid(sid);
    this._users[id] = this._users[user.id];
    delete this._users[user.id];
  }

  getUserById(id) {
    return this._users[id];
  }

  getUserByPid(pid) {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].pid === pid)
          return { id, user: this._users[id] };
      }
      return undefined;
  }

  getUserBySid(sid) {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].sid === sid) {
          return { id, user: this._users[id] };
        }
      }
      return undefined;
  }
}

module.exports = UserCollection;
