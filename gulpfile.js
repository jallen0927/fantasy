'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    nodemon = require('gulp-nodemon');

gulp.task('browser-sync', ['nodemon'], function() {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["**/*.js"],
        // browser: "google chrome",
        port: 8000,
        notify: true
    });
});

gulp.task('nodemon', function (cb) {

    var started = false;

    return nodemon({
        script: 'server/app.js',
        ignore: [
            'gulpfile.js',
            'node_modules/'
        ]
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function () {
        setTimeout(function () {
            reload({ stream: false });
        }, 1000);
    });
});

gulp.task('default', ['browser-sync'], function () {

});