var gulp = require('gulp'),
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

gulp.task('default', ['server'], () => {
  return gulp.watch(['./index.js'], ['server']);
});

process.on('exit', () => {
    if (node)
      node.kill();
});
