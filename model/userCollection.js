class UserCollection {
  constructor () {
    this._users = {};
  }

  get users() { return Object.keys(this._users).map(k => this._users[k]); }

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

  getUserByPid(pid) {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].pid === pid)
          return this._users[id];
      }
      return undefined;
  }

  getUserBySid(sid) {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].sid === sid)
          return this._users[id];
      }
      return undefined;
  }
}

export { UserCollection };
