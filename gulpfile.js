// npm i -g gulp
// npm i gulp gulp-uglify gulp-rename gulp-concat gulp-header gulp-minify-css gulp-watch
var gulp = require('gulp'),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    concat = require('gulp-concat'),
   	webserver = require('gulp-webserver'),
   	templateCache = require('gulp-angular-templatecache'),
   	sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    pkg = require('./package.json');

gulp.task('scripts', function() {
    gulp.src([
    	"app/bower_components/angular/angular.js",
    	"app/bower_components/angular-route/angular-route.js",    	
    	//"public/build/templateCacheModule.js",
    	"app/app.js",
    	"app/components/**/*.js",
    	"app/bower_components/angular-animate/angular-animate.min.js",
    	"app/bower_components/angular-loading-bar/build/loading-bar.min.js",
    	"app/bower_components/checklist-model/checklist-model.js",
    	"app/bower_components/angular-bootstrap/ui-bootstrap.min.js",
    	"app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
    	"app/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js"
    ])
    	.pipe(concat("app.js"))
       	.pipe(jsmin())
        .pipe(rename({suffix: '.min'})) // renaming file to myproject.min.js
        .pipe(header('/*! <%= pkg.name %> <%= pkg.version %> */\n', {pkg: pkg} )) // banner with version and name of package
        .pipe(gulp.dest('./app/build/')) // save file to destination directory
});

gulp.task('copyIndex', function() {
	gulp.src([
    	"app/index.html"
    ])
    	.pipe(gulp.dest('public'));
});

gulp.task('sass', function () {
  gulp.src('./app/scss/**/*.scss')
    .pipe(sass({outputStyle: "compact"}).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./app/build/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./app/scss/**/*.scss', ['sass']);
});

gulp.task('watch:js', function () {
  gulp.watch('./app/**/*.js', ['scripts']);
});

gulp.task('watch:html', function () {
  gulp.watch('./app/**/*.html', ['copyIndex']);
});

gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true,
      host: "0.0.0.0"
    }));
});

gulp.task('compileTemplates', function () {
  return gulp.src('./app/components/**/*.html')
    .pipe(templateCache("templateCacheModule.js", { module:'templateCacheModule', standalone: true, root: './public/build' }))
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['compileTemplates', 'scripts', 'sass', 'copyIndex']);
gulp.task('watch', ['watch:js', 'sass:watch']);