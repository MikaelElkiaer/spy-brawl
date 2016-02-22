class UserService {
  constructor(localStorageService) {
    this.storage = localStorageService;
  }
}

UserService.$inject = ['localStorageService'];

export { UserService }
