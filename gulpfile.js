var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    server = require( 'gulp-develop-server' );

gulp.task('watcher', cb => {
  livereload.listen();
  gulp.watch(['public/**/*', '!public/views/**/*.jade'], e => {
    livereload.changed(e);
  });
  gulp.watch('public/views/**/*.jade', e => livereload.reload());
  cb();
});

gulp.task('server', () => {
  server.listen( { path: './index.js', execArgv: ['--use_strict'] } );

  return gulp.watch( [ './index.js', './model/**/*.js', './socketHandlers/**/*.js' ], server.restart );
});
