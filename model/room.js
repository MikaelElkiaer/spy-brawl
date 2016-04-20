class RoomUser {
  constructor(user, isHost) {
    this._user = user;
    this._ready = false;
    this._isHost = isHost;
  }

  get user() { return this._user; }
  get ready() { return this._ready; }
  set ready(value) { this._ready = value; }
  get isHost() { return this._isHost; }

  get public() {
    return { user: this._user.public, ready: this._ready, isHost: this._isHost };
  }
}

class Room {
  constructor(hostPid, user) {
    this._users = {};
    this._users[hostPid] = new RoomUser(user, true);
  }

  get users() { return this._users; }

  addUser(pid, user, isHost) { this._users[pid] = new RoomUser(user, isHost || false); }
  removeUser(pid) { delete this._users[pid]; }

  getUserByPid(pid) {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  getAll() {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid].public;
    });
    return result;
  }
}

class RoomCollection {
  constructor() {
    this._rooms = {};
  }

  get rooms() { return this._rooms; }

  addRoom(id, room) {
    if (!this._rooms[id])
      this._rooms[id] = room;
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  removeRoom(id) {
    if (this._rooms[id])
      delete this._rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  getRoomById(id) { return this._rooms[id]; }
}

module.exports = { Room, RoomCollection };
