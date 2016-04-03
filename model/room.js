class Room {
  constructor(UserCollection, host) {
    this._userCollection = new UserCollection();
    this._host = host;
  }

  get users() { return this._userCollection.users; }
  get host() { return this._host; }
}

module.exports = Room;
