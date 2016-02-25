function config(localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('spyfall');
}

config.$inject = ['localStorageServiceProvider'];

export { config }
