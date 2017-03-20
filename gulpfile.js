var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
//var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var juice = require('premailer-gulp-juice'); //for inline css
var gutil = require( 'gulp-util' );
var ftp = require( 'vinyl-ftp' );

//var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    //console.log('jekyll-build =>');
    browserSync.notify(messages.jekyllBuild);
    //return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
    return cp.spawn( 'C:\\tools\\ruby23\\bin\\jekyll.bat' , ['build'], {stdio: 'inherit'})  
        .on('error', (error) => gutil.log(gutil.colors.red(error.message))) 
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'scripts', 'jekyll-build'], function() {
    browserSync.init({
        server: {
            baseDir: './_site'            
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_sass/*.scss')
            // .on('error', function (err) {
            // console.error('Error!', err.message);
            // })
        //Initializes sourcemaps
        //.pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['_sass'],
            onError: browserSync.notify()}).on('error', sass.logError))
        //.on('error', sass.logError))
        // .pipe(sass())
        //.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('./_sass/*.scss', ['sass']);
    gulp.watch('./_js/social-buttons.js', ['scripts']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*.html'], ['jekyll-rebuild']);
});


// not enabled in task section
gulp.task('scripts', function() {
  gulp.src('./_js/social-buttons.js')
  //.pipe(concat('all.min.js'))
  //.pipe(uglify())
  //.pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('_site/assets/js/'));
});

gulp.task('default', ['browser-sync', 'watch']);
/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */


gulp.task( 'deploy', function () {
    //DELETE 3 LINES
    var conn = ftp.create( {

        parallel: 10,
        log:      gutil.log,
        secure:   true,
        secureOptions: {
            rejectUnauthorized: false
        }
} );

    var globs = ['assets/css/**', 'js/**','fonts/**', '!node_modules/**', '/index.html'];
 
    // using base = '.' will transfer everything to /public_html correctly 
    // turn off buffering in gulp.src for best performance 
    return gulp.src( '_site/**', { base: './_site/', buffer: false } )
        .pipe( conn.newer( '/ho' ) ) // only upload newer files 
        .pipe( conn.dest( '/ho' ) );
        //.pipe( conn.clean( '/**', './_site/**'));
} );

 
// gulp.task( 'deploy', function () {
//     //DELETE 3 LINES
//     var conn = ftp.create( {
// host:     '121alap.awardspace.com',
// user:     '',
// password: '',
//         parallel: 10,
//         log:      gutil.log,
//     //     secure:   true,
//     //     secureOptions: {
//     //         rejectUnauthorized: false
//     // }
// } );

//     var globs = ['assets/css/**', 'js/**','fonts/**', '!node_modules/**', '/index.html'];
 
//     // using base = '.' will transfer everything to /public_html correctly 
//     // turn off buffering in gulp.src for best performance 
//     return gulp.src( '_site/**', { base: './_site/', buffer: false } )
//         .pipe( conn.newer( '/ho' ) ) // only upload newer files 
//         .pipe( conn.dest( '/ho' ) );
//         //.pipe( conn.clean( '/**', './_site/**'));
// } );


// gulp.task(
//   'ftp-clean',
//   function () {
//     var conn = ftp.create( ftpOptions );
//     return conn.clean( globs, local, { base: '.' } );
//   }
// );


// Generate inline css for email newsletters
gulp.task('in', function(){
  gulp.src('./_site/email26-susy.html')
    .pipe(juice({}))
    .pipe(gulp.dest('./_site/mail.inliner.html'));
});//gulp.task('deploy', ['sass', 'in']);

