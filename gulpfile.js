// Copyright (c) 2015 Heye Vöcking

/*global require:false */

(function () {
  'use strict';

  var
    _ = require('lodash'),
    autoprefixer = require('gulp-autoprefixer'),
    cache = require('gulp-cache'),
    concat = require('gulp-concat'),
    expectFile = require('gulp-expect-file'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    ignore = require('gulp-ignore'),
    inject = require('gulp-inject'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    tinylr = require('tiny-lr'),
    uglify = require('gulp-uglify'),
    args = require('minimist')(process.argv.slice(2)),

    releaseBuild = args.build === 'release',
    testBuild = args.build === 'test',
    debugBuild = !releaseBuild && !testBuild,
    targetDir = (
      testBuild && './dist/test'
    ) || (
      debugBuild && './dist/debug'
    ) || (
      releaseBuild && './dist/release'
    ),
    index = (
      testBuild && 'test/index.html'
    ) || (
      debugBuild && 'src/index.html'
    ) || (
      releaseBuild && 'src/index.html'
    ),

    css_files = [],

    ut_css_files = [
      'node_modules/mocha/mocha.css'
    ],

    plugin_files = [
    ],

    script_files = [
      'src/scripts/Background.js',
      'src/scripts/Main.js'
    ],

    ut_plugin_files = [
      'node_modules/chai/chai.js',
      'node_modules/mocha/mocha.js',
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/sinon-chrome/chrome.js',
      'test/InstallMocks.js'
    ],

    ut_script_files = [
      'test/TestBackground.js'
    ],

    reminent_files = [
      'src/bower_components/chrome-app-livereload/livereload.js',
      'src/manifest.json'
    ];

  if (testBuild) {
    plugin_files = plugin_files.concat(ut_plugin_files);
    script_files = script_files.concat(ut_script_files);
    css_files = css_files.concat(ut_css_files);
  }

  // Clear the cache
  gulp.task('clear', function () {
    cache.clearAll();
  });

  // Css styles
  gulp.task('css', function () {
    return gulp.src(css_files)
      .pipe(expectFile.real(css_files))
      .pipe(gulp.dest(targetDir + '/styles'))
      .pipe(gulpif(releaseBuild, rename({ suffix: '.min' })))
      .pipe(gulpif(releaseBuild, minifycss()))
      .pipe(size())
      .pipe(notify({ message: 'Css task complete' }));
  });

  // Styles
  gulp.task('styles', function () {
    return gulp.src('src/styles/main.scss')
      .pipe(expectFile.real('src/styles/main.scss'))
      .pipe(sass({ style: 'expanded' }))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
      .pipe(gulp.dest(targetDir + '/styles'))
      .pipe(gulpif(releaseBuild, rename({ suffix: '.min' })))
      .pipe(gulpif(releaseBuild, minifycss()))
      .pipe(size())
      .pipe(notify({ message: 'Styles task complete' }));
  });

  // First-Party Scripts
  gulp.task('scripts', function () {
    return gulp.src(script_files)
      .pipe(expectFile.real(script_files))
      .pipe(gulpif(releaseBuild, concat('main.js')))
      .pipe(gulp.dest(targetDir + '/scripts'))
      .pipe(gulpif(releaseBuild, rename({ suffix: '.min' })))
      .pipe(gulpif(releaseBuild, uglify()))
      .pipe(size())
      .pipe(notify({ message: 'Scripts task complete' }));
  });

  // Third-Party Scripts
  gulp.task('plugins', function () {
    return gulp.src(plugin_files)
      .pipe(expectFile.real(plugin_files))
      .pipe(gulpif(releaseBuild, rename({ suffix: '.min' })))
      .pipe(gulpif(releaseBuild, concat('plugins.js')))
      .pipe(gulpif(releaseBuild, uglify()))
      .pipe(gulp.dest(targetDir + '/scripts'))
      .pipe(size())
      .pipe(notify({ message: 'Plugins task complete' }));
  });

  // Other files
  gulp.task('reminent', function () {
    return gulp.src(reminent_files)
      .pipe(expectFile.real(reminent_files))
      .pipe(size())
      .pipe(gulp.dest(targetDir + '/'))
      .pipe(notify({ message: 'Other files task complete' }));
  });

  // After all minification is done we can inject the newly created files into the html
  gulp.task('index', ['css', 'styles', 'plugins', 'scripts', 'reminent'], function () {
    // We src all files under dist, where the plugins directory has precedence
    var srcFiles, dstFiles;
    srcFiles = [];
    dstFiles = [targetDir + '/styles/*'];
    if (releaseBuild) {
      srcFiles.push('plugins.js');
      srcFiles.push('main.js');
    } else {
      srcFiles = plugin_files.concat(script_files);
    }
    _.each(srcFiles, function (file) {
      dstFiles.push(targetDir + '/scripts/' + file.split('/').pop());
    });
    return gulp.src([index])
      .pipe(expectFile.real(index))
      // and inject them into the HTML
      .pipe(inject(gulp.src(dstFiles), {
        read: false, // we just need the paths
        addRootSlash: false, // ensures proper relative paths
        ignorePath: targetDir.substr(1) + '/' // ensures proper relative paths
      }))
      .pipe(size())
      .pipe(gulp.dest(targetDir + '/'));
  });

  // Clean
  gulp.task('clean', function () {
    return gulp.src([targetDir + '/*'], {read: false})
        .pipe(rimraf());
  });

  // Watch
  gulp.task('watch', ['index'], function () {

    // Watch index.html file
    gulp.watch(index, ['index']);

    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch .css files
    gulp.watch(css_files, ['css']);

    // Watch .js files
    gulp.watch(script_files, ['scripts']);

    // Watch other file
    gulp.watch(reminent_files, ['reminent']);

    // Create LiveReload server
    var lr = tinylr();
    lr.listen(35729);

    // Watch every file intargetDir, reload on change
    gulp.watch([targetDir + '/**']).on('change', function (evt) {
      lr.changed({
        body: {
          files: [evt.path]
        }
      });
    });
  });

}());
