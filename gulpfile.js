var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var umd = require('gulp-umd');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var path = require('path');
var mocha = require('gulp-mocha');

gulp.task('clean', function () {
  return gulp.src('dist', { read: false })
    .pipe(clean());
});

gulp.task('lint', function() {
  return gulp.src('src/jst9.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('build', ['clean'], function() {
  return gulp.src([
    'src/jst9.js'
    ])
    .pipe(concat('jst9.js'))
    .pipe(umd({
      exports: function(file) {
        return 'jsT9';
      },

      namespace: function() {
        return 'jsT9';
      },

      dependencies: function() {
        return [
          {
            name: 'axios',
            amd: 'axios',
            cjs: 'axios',
            global: 'axios',
            param: 'axios'
          }
        ];
      },

      template: path.join(__dirname, '/src/umdTemplate.js')
    }))
    .pipe(gulp.dest('dist'))
    .pipe(rename('jst9.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['build'], function() {
  return gulp.src('test/*Test.js')
    .pipe(mocha({
      globals: ['chai'],
      timeout: 6000,
      ignoreLeaks: false,
      ui: 'bdd',
      reporter: 'spec'
    }));
});
