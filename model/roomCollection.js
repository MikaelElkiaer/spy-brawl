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

module.exports = RoomCollection;
