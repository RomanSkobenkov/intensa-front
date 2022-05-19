const {src, dest, parallel, series, watch} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagecomp = require('compress-images');
const del = require('del');


function browsersync() {
    browserSync.init({
        server: {baseDir: 'app/'},
        notify: true,
        online: true
    })
}

function styles() {
    return src('app/sass/main.sass')
        .pipe(sass())
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions']}))
        .pipe(cleancss({level: {1: {specialComments: 0}}}))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

async function images() {
    imagecomp(
        "app/img/src/**/*",
        "app/img/dest/",
        { compress_force: false, statistic: true, autoupdate: true }, false,
        { jpg: { engine: "mozjpeg", command: ["-quality", "75"] } },
        { png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
        { svg: { engine: "svgo", command: "--multipass" } },
        { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
        function (err, completed) {
            if (completed === true) {
                browserSync.reload()
            }
        }
    )
}

function cleanimg() {
    return del('app/img/dest/**/*', { force: true })
}

function cleandist() {
    return del('dist/**/*', { force: true })
}

function buildcopy() {
    return src([
        'app/css/**/*.min.css',
        'app/img/dest/**/*',
        'app/**/*.html',
    ], { base: 'app' })
        .pipe(dest('dist'))
}

function startwatch() {
    watch('app/**/sass/**/*', styles);
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/img/src/**/*', images);
}


exports.browsersync = browsersync;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.build = series(styles, images, buildcopy);
exports.default = parallel(cleandist, styles, browsersync, startwatch);