"use strict";

var Room = require('./room').Room;
var IdGenerator = require('./idGenerator');
var idGenerator = new IdGenerator(require('crypto'));

class User {
  constructor() {
    this._sid = idGenerator.generate();
    this._pid = idGenerator.generate();
    this._username = User.getNextUsername();
    this._active = true;
  }

  get sid() { return this._sid; }

  get pid() { return this._pid; }

  get username() { return this._username; }
  set username(username) { this._username = username; }

  get active() { return this._active; }
  set active(active) { this._active = active; }

  get public() { return { pid: this.pid, username: this.username, active: this.active }; }

  static getNextUsername() {
    if (!this._nextUsernumber)
      this._nextUsernumber = 1;

    return `guest${this._nextUsernumber++}`;
  }

  static isValidUsername(username, users) {
    var regex = /^\w{2,12}$/;
    if (!regex.test(username))
      return false;

    var ids = Object.keys(users);
    for (var i = 0; i < ids.length; i++)
      if (users[ids[i]].username === username)
        return false;

    return true;
  }
}

class UserCollection {
  constructor () {
    this._users = {};
  }

  getAll(inactive) {
    var result = {};
    Object.keys(this._users).forEach(id => {
      var user = this._users[id];
      if (inactive || user.active)
        result[user.pid] = user.public;
    });
    return result;
  }

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

  changeId(sid, id, activate) {
    var user = this.getUserBySid(sid);
    this._users[id] = this._users[user.id];
    delete this._users[user.id];

    if (activate)
      this._users[id].active = true;
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

module.exports = { User, UserCollection };
