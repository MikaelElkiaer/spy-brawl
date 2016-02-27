function config(localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('spybrawl');
}

config.$inject = ['localStorageServiceProvider'];

export { config };
