class UserService {

  constructor(localStorageService) {
    this.storage = localStorageService;

    this._userSidKey = 'userSid';
    this._userPidKey = 'userPid';
    this._usernameKey = 'username';
  }

  clearUserSid() {
    this.userSid = '';
  }

  clearUserPid() {
    this.userPid = '';
  }

  clearUsername() {
    this.username = '';
  }

  get userSid() {
    return this.storage.get(this._userSidKey);
  }

  get userPid() {
    return this.storage.get(this._userPidKey);
  }

  get username() {
    return this.storage.get(this._usernameKey);
  }

  set userSid(sid) {
    this.storage.set(this._userSidKey, sid);
  }

  set userPid(pid) {
    this.storage.set(this._userPidKey, pid);
  }

  set username(username) {
    this.storage.set(this._usernameKey, username);
  }
}

UserService.$inject = ['localStorageService'];

export { UserService };
