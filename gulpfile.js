// Copyright (c) 2015 Heye Vöcking

/*global require:false */

(function () {
  'use strict';

  var
    _ = require('lodash'),
    autoprefixer = require('gulp-autoprefixer'),
    cache = require('gulp-cache'),
    combine = require('gulp-jsoncombine'),
    concat = require('gulp-concat'),
    cson = require('gulp-cson'),
    expectFile = require('gulp-expect-file'),
    del = require('del'),
    data = require('gulp-data'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    ignore = require('gulp-ignore'),
    inject = require('gulp-inject'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    tinylr = require('tiny-lr'),
    uglify = require('gulp-uglify'),
    args = require('minimist')(process.argv.slice(2)),

    releaseBuild = args.build === 'release',
    testBuild = args.build === 'test',
    debugBuild = !releaseBuild && !testBuild,
    dest = (
      testBuild && 'dist/test'
    ) || (
      debugBuild && 'dist/debug'
    ) || (
      releaseBuild && 'dist/release'
    ),
    index = (
      testBuild && 'test/index.html'
    ) || (
      debugBuild && 'src/index.html'
    ) || (
      releaseBuild && 'src/index.html'
    ),

    css_files = [],

    test_css_files = [
      'node_modules/mocha/mocha.css'
    ],

    plugin_files = [
    ],

    script_files = [
      'src/scripts/Background.js',
      'src/scripts/Main.js'
    ],

    script_start_file = 'src/scripts/Start.js',

    test_script_start_file = 'test/StartTests.js',

    test_plugin_files = [
      'node_modules/chai/chai.js',
      'node_modules/mocha/mocha.js',
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/sinon-chrome/chrome.js',
      'src/bower_components/lodash/lodash.js'
    ],

    test_script_files = [
      'test/TestMain.js'
    ],

    manifest_files = [
      'projectz.cson'
    ],

    livereload_files = [
      'src/bower_components/chrome-app-livereload/livereload.js'
    ];

  if (testBuild) {
    plugin_files = test_plugin_files;
    script_files = [].concat(
      script_files,
      test_script_files
    );
    script_files.push(test_script_start_file);
    css_files = test_css_files;
  } else {
    script_files.push(script_start_file);
  }

  // Clear the cache
  gulp.task('clear', function () {
    cache.clearAll();
  });

  gulp.task('config', function () {
    return gulp.src('config.json')
      .pipe(expectFile.real('config.json'))
      .pipe(combine('', function (contents) {
      }))
      .pipe(notify({ message: 'Config task complete' }));
  });

  function makeManifest(contents) {
    var config = contents.projectz;
    return new Buffer(JSON.stringify({
      name: config.title,
      version: config.version,
      description: config.description,
      author: config.author,
      short_name: config.name,
      version_name: config.version + ' ' + config.version_name,
      manifest_version: 2,
      minimum_chrome_version: '28',
      offline_enabled: true,
      "sandbox": (
        testBuild && {"pages": ["index.html"]}
      ) || undefined,
      app: {
        background: {
          scripts: [(
            testBuild && 'scripts/Background.js'
          ) || (
            debugBuild && 'scripts/Background.js'
          ) || (
            releaseBuild && 'scripts/main.js'
          )],
          persistent: false
        }
      },
      permissions: [
        {
          fileSystem: [
            'directory',
            'write',
            'retainEntries'
          ]
        },
        'storage'
      ],
      file_handlers: {
        image: {
          types: [
            'image/png',
            'image/jpg',
            'image/jpeg'
          ]
        }
      }
    }));
  }

  gulp.task('manifest', function () {
    return gulp.src(manifest_files)
      .pipe(expectFile.real(manifest_files))
      .pipe(cson())
      .pipe(combine('manifest.json', makeManifest))
      .pipe(size())
      .pipe(gulp.dest(dest + '/'))
      .pipe(notify({ message: 'Manifest task complete' }));
  });

  // Css styles
  gulp.task('css', function () {
    return gulp.src(css_files)
      .pipe(expectFile.real(css_files))
      .pipe(gulp.dest(dest + '/styles'))
      .pipe(gulpif(releaseBuild, minifycss()))
      .pipe(size())
      .pipe(notify({ message: 'Css task complete' }));
  });

  // Scss styles (which need compilation)
  gulp.task('styles', function () {
    return gulp.src('src/styles/main.scss')
      .pipe(expectFile.real('src/styles/main.scss'))
      .pipe(sass({ style: 'expanded' }))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
      .pipe(gulp.dest(dest + '/styles'))
      .pipe(gulpif(releaseBuild, minifycss()))
      .pipe(size())
      .pipe(notify({ message: 'Styles task complete' }));
  });

  // Third-Party Scripts
  gulp.task('plugins', function () {
    return gulp.src(plugin_files)
      .pipe(expectFile.real(plugin_files))
      .pipe(gulpif(releaseBuild, concat('plugins.js')))
      .pipe(gulpif(releaseBuild, uglify()))
      .pipe(gulp.dest(dest + '/scripts'))
      .pipe(size())
      .pipe(notify({ message: 'Plugins task complete' }));
  });

  // First-Party Scripts
  gulp.task('scripts', function () {
    return gulp.src(script_files)
      .pipe(expectFile.real(script_files))
      .pipe(gulpif(releaseBuild, concat('main.js')))
      .pipe(gulpif(releaseBuild, uglify()))
      .pipe(gulp.dest(dest + '/scripts'))
      .pipe(size())
      .pipe(notify({ message: 'Scripts task complete' }));
  });

  // Livereload files
  gulp.task('livereload', function () {
    return gulp.src(livereload_files)
      .pipe(expectFile.real(livereload_files))
      .pipe(ignore.exclude(releaseBuild))
      .pipe(size())
      .pipe(gulp.dest(dest + '/'))
      .pipe(notify({ message: 'Livereload task complete' }));
  });

  // After all minification is done we can inject the newly created files into the html
  gulp.task('index', ['manifest', 'css', 'styles', 'plugins', 'scripts', 'livereload'], function () {
    // We src all files under dist, we have to inject them in the correct order
    // to not break dependencies. The order is specified the in the plugin and script
    // files arrays. The plugin files array must come first because the script files
    // depend on the plugin files.
    var srcFiles, dstFiles;
    srcFiles = [];
    dstFiles = [dest + '/styles/*'];
    if (releaseBuild) {
      srcFiles.push('plugins.js');
      srcFiles.push('main.js');
    } else {
      srcFiles = plugin_files.concat(script_files);
    }
    _.each(srcFiles, function (file) {
      dstFiles.push(dest + '/scripts/' + file.split('/').pop());
    });
    return gulp.src(index)
      .pipe(expectFile.real(index))
      // and inject them into the HTML
      .pipe(inject(gulp.src(dstFiles), {
        read: false, // we just need the paths
        addRootSlash: false, // ensures proper relative paths
        ignorePath: '/' + dest + '/' // ensures proper relative paths
      }))
      .pipe(inject(
        gulp.src(dest + '/' + 'livereload.js', {read: false}), {
          starttag: '<!-- inject:livereload -->',
          transform: function () {
            return '<script src="livereload.js?host=localhost&port=35729"></script>';
          }
        }
      ))
      .pipe(size())
      .pipe(gulp.dest(dest + '/'));
  });

  // Clean
  gulp.task('clean', function () {
    del(dest);
  });

  // Watch
  gulp.task('watch', ['index'], function () {

    // Watch index.html file
    gulp.watch(index, ['index']);

    // Watch manifest files
    gulp.watch(manifest_files, ['manifest']);

    // Watch .css files
    gulp.watch(css_files, ['css']);

    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch(script_files, ['scripts']);

    // Create LiveReload server
    var lr = tinylr();
    lr.listen(35729);

    // Watch every file intargetDir, reload on change
    gulp.watch([dest + '/**']).on('change', function (evt) {
      lr.changed({
        body: {
          files: [evt.path]
        }
      });
    });
  });

}());
