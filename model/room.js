class Room {
  constructor(host, UserCollection) {
    this._host = host;
    this._userCollection = new UserCollection();
  }

  get users() { return this._userCollection.users; }
  get host() { return this._host; }
}

module.exports = Room;
