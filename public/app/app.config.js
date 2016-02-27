function config(localStorageServiceProvider, toastrConfig) {
  localStorageServiceProvider.setPrefix('spybrawl');

  angular.extend(toastrConfig, {
    maxOpened: 3,
    preventOpenDuplicates: true
  });
}

config.$inject = ['localStorageServiceProvider', 'toastrConfig'];

export { config };
