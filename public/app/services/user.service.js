class UserService {

  constructor(localStorageService) {
    this.storage = localStorageService;

    this._userSidKey = 'userSid';
    this._usernameKey = 'username';
  }

  clearUserSid() {
    this.userSid = '';
  }

  clearUsername() {
    this.username = '';
  }

  get userSid() {
    return this.storage.get(this._userSidKey);
  }

  get username() {
    return this.storage.get(this._usernameKey);
  }

  set userSid(sid) {
    this.storage.set(this._userSidKey, sid);
  }

  set username(username) {
    this.storage.set(this._usernameKey, username);
  }
}

UserService.$inject = ['localStorageService'];

export { UserService };
