class User {
  constructor(idGenerator) {
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

  static getNextUsername() {
    if (!this._nextUsernumber)
      this._nextUsernumber = 1;

    return `Guest ${this._nextUsernumber++}`;
  }

  static isValidUsername(username) {
    return true;
  }
}

module.exports = User;
