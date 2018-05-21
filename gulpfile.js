const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const browserify = require('browserify');
const es2015 = require('babel-preset-es2015');
const source = require('vinyl-source-stream');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const path = require('path');
const uglify = require('gulp-uglify');
const streamify = require('gulp-streamify');

const paths = {
    sass: [
        './src/sass/**/*.scss',
    ],

    js: [
        './src/js/**/*.js',
    ],

    includes: [
        path.join(__dirname, 'node_modules'),
    ],
};

gulp.task('default', ['watch']);

gulp.task('watch', () => {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['browserify']);
});

gulp.task('sass', () => {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({ includePaths: paths.includes }))
        .on('error', sass.logError)
        .pipe(postcss([
            autoprefixer({
                browsers: [
                    'last 2 versions',
                    'iOS 8',
                    'Android >= 2.1.0',
                ],
            }),
        ]))
        .pipe(gulp.dest('./assets/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0,
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./assets/css/'));
});

gulp.task('browserify', () => {
    browserify('./src/js/main.js', { debug: true, paths: paths.includes })
        .transform('babelify', {
            presets: [es2015],
        })
        .bundle()
        .on('error', function (err) {
            gutil.log(gutil.colors.red(`JavaScript ERROR:\n${err.stack}`));
            this.emit('end');
        })
        // Pass desired output filename to vinyl-source-stream
        .pipe(source('scripts.js'))
        .pipe(gulp.dest('./assets/js/'))
        .pipe(streamify(uglify()))
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('./assets/js/'));
});


gulp.task('sync', ['sass', 'browserify']);
