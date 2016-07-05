var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  spawn = require('child_process').spawn,
  node;

gulp.task('server', cb => {
  if (node)
    node.kill();
  node = spawn('node', ['index.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8)
      gulp.log('Error detected, waiting for changes...');
  });
  cb();
});

gulp.task('browser-sync', ['server'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:5000",
        files: ["public/**/*.*"],
        port: 7000,
        ws: true,
        notify: false
	});
});

gulp.task('default', ['browser-sync', 'server'], () => {
  return gulp.watch(['./index.js'], ['server']);
});

process.on('exit', () => {
    if (node)
      node.kill();
});
