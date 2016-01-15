var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');


gulp.task('default', function() {
    var b = browserify({
        entries: './src/main.es6',
        debug: true,
        standalone: 'staff',
        extensions: ['.es6'],
        transform: [babelify]
    });

    return b.bundle()
        .pipe(source('./src/main.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
});

