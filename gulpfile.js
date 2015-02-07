'use strict';

var del = require('del');

var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var handlebars = require('gulp-compile-handlebars');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');


var jsPath = './client/js/app.js';
var sassPath = './client/sass/*.scss';
var templatePath = './client/templates/**.hbs';
var templatePartialPath = './client/templates/partials';
var buildPath = './build';

gulp.task('default', ['watch', 'build']);

gulp.task('clean', function() {
    del([buildPath]);
});

gulp.task('watch', function() {
    gulp.watch(jsPath, ['build-scripts']);
    gulp.watch(sassPath, ['build-sass']);
    gulp.watch(templatePath, ['build-templates']);
});

gulp.task('build', ['build-scripts', 'build-sass', 'build-templates']);

// runs the unit tests
gulp.task('test', function() {

});

// compiles the javascript files
gulp.task('build-scripts', function() {
    gulp.src(jsPath)
        .pipe(browserify({
          insertGlobals : false,
          debug : !gulp.env.production
        }))
        .pipe(gulp.dest(buildPath + '/js'))
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest(buildPath + '/js'));
});

// compiles the Sass files and minimizes them
gulp.task('build-sass', function() {
    gulp.src(sassPath)
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(rename('app.css'))
        .pipe(gulp.dest(buildPath + '/css'))
        .pipe(sourcemaps.init())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(rename('app.min.css'))
        .pipe(gulp.dest(buildPath + '/css'));
});

// builds the handlebars templates
gulp.task('build-templates', function() {
    var templateData = {
        homeTitle: 'Sudoku'
    };
    var options = {
        ignorePartials: true,
        batch : [templatePartialPath],
        helpers: {
            cssAsset: function(file) {
                return 'css/' + file + '.min.css';
            },
            jsAsset: function(file) {
                return 'js/' + file + '.min.js';
            }
        }
    };
 
    gulp.src(templatePath)
        .pipe(handlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(buildPath));
});