"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const cleanCSS = require('gulp-clean-css');
const concatCSS = require('gulp-concat-css');
const concatJS = require('gulp-concat');
const fileinclude = require('gulp-file-include');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(['./dist/']);
}

function buildHTML() {
  var html = gulp.src([
    './public/**/*.html',
    '!./public/**/*.part.html'
  ])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist/'));

  return html;
}

function buildCSSVendor() {
  // Bootstrap
  var css = gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css'])
    .pipe(concatCSS("./vendor.min.css"))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./dist/css/'));
  return css;
}

function buildCSSOwn() {
  var mycss = gulp.src(['./public/css/**/*'])
    .pipe(concatCSS("./bundle.min.css"))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./dist/css/'));
  return mycss;
}

function buildJSVendor() {
  // jQuery
  var js = gulp.src([
    './node_modules/jquery/dist/jquery.slim.min.js',
    '!./node_modules/jquery/dist/core.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
  ])
    .pipe(concatJS('vendor.min.js'))
    .pipe(gulp.dest('./dist/js/'));
  return js;
}

// Bring third party dependencies from node_modules into vendor directory
function buildDist() {
  return merge(buildHTML(), buildCSSVendor(), buildCSSOwn(), buildJSVendor());
}

// Watch files
function watchFiles() {
  gulp.watch("./public/css/**/*.css", buildDist, browserSyncReload);
  gulp.watch("./public/**/*.html", buildDist, browserSyncReload);
}

// Define complex tasks
const build = gulp.series(clean, buildDist);
const watch = gulp.series(buildDist, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
