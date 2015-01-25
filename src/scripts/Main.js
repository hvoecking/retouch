// Copyright (c) 2015 Heye Vöcking

/*global FileAPI:false */
/*global ImageProcessor:false */

/*global PresetFilters:false */
/*global output_canvas:false */
/*global output_div:false */

/*global Filesystem:false */
/*global ImageProcessor:false */
/*global ImageGallery:false */

/*global launchData:false */

(function () {
  'use strict';

  var
    chooseFileButton = document.querySelector('#choose_file'),
    saveFileAsButton = document.querySelector('#save_file_as'),
    chooseDirectoryButton = document.querySelector('#choose_directory'),
    previousButton = document.querySelector('#previous_file'),
    nextButton = document.querySelector('#next_file'),
    discardButton = document.querySelector('#discard'),
    acceptButton = document.querySelector('#accept'),
    undoButton = document.querySelector('#undo'),
    redoButton = document.querySelector('#redo'),
    output = document.querySelector('output'),
    processor = null,
    gallery = null;

  function displayText(err, message) {
    var args, result;
    args = Array.apply(null, arguments).slice(2);
    if (err) {
      result = ['Error', message, '-', err];
    } else {
      result = ['Done', message];
    }
    result.concat(args);
    output.textContent = Array.apply(null, result).join(' ');
  }

  function displayImageFile(file, message) {
    var onLoad = uiProgress(message + ' ' + (file && file.fullPath), updateInterface);
    processor = new ImageProcessor(file, onLoad);
  }

  function uiProgress(message, cb) {
    output_canvas.innerHTML = '<div class="loader"></div>';
    output_div.style.display = '';
    return function (err, canvas) {
      if (err) {
        return cb(err, message);
      }

      output_canvas.innerHTML = '';
      output_canvas.appendChild(canvas);

      if (processor.processing) {
        processor.processing.el.innerHTML = processor.processing.html;
        processor.processing = false;
      }

      if (cb) {
        cb(err, message);
      }
    };
  }

  function updateInterface(err, message, cb) {
    displayText(err, message);
    nextButton.disabled = !gallery;
    previousButton.disabled = !gallery;
    saveFileAsButton.disabled = !processor;
    acceptButton.disabled = !(processor && processor.canAccept());
    discardButton.disabled = !(processor && processor.canAccept());
    undoButton.disabled = !(processor && processor.canUndo());
    redoButton.disabled = !(processor && processor.canRedo());
    processor && processor.render(cb);
  }

  function selectPresetFilter(el) {
    var filter, lastActiveNode;
    filter = el.dataset.preset;

    if (!processor.processing && el.tagName === 'A') {
      processor.processing = {el: el, html: el.innerHTML};

      lastActiveNode = el.parentNode.querySelector('.Active');
      if (lastActiveNode) {
        lastActiveNode.classList.remove('Active');
      }
      el.innerHTML = 'Rendering&hellip;';
      el.className = 'Active';

      processor.preview(filter);

      updateInterface(null, 'applying filter ' + filter, uiProgress('rendering'));
    }
  }

  // Set filter
  FileAPI.event.on(PresetFilters, 'click', function (evt) {
    selectPresetFilter(evt.target);
  });

  acceptButton.addEventListener('click', function () {
    processor.accept();
    updateInterface(null, 'accept');
  });

  discardButton.addEventListener('click', function () {
    processor.discard();
    updateInterface(null, 'discard');
  });

  undoButton.addEventListener('click', function () {
    processor.undo();
    updateInterface(null, 'undo');
  });

  redoButton.addEventListener('click', function () {
    processor.redo();
    updateInterface(null, 'redo');
  });

  nextButton.addEventListener('click', function () {
    console.assert(gallery);
    displayImageFile(gallery.next(), 'next');
  });

  previousButton.addEventListener('click', function () {
    console.assert(gallery);
    displayImageFile(gallery.previous(), 'previous');
  });

  saveFileAsButton.addEventListener('click', function () {
    processor.store(null, function (err) {
      console.log(arguments);
      if (err) {
        return displayText(err, 'storing file');
      }
      updateInterface();
      displayText(null, 'writing');
    });
  });

  chooseFileButton.addEventListener('click', function () {
    // TODO: Load accepts from manifest and pass on
    displayImageFile(null, 'choosing file')
  });

  chooseDirectoryButton.addEventListener('click', function () {
    Filesystem.userOpenDir(function (err, entry) {
      gallery = new ImageGallery(entry, function(err) {
        if (err) { displayText(err, 'opening gallery file'); }
        displayImageFile(gallery.current(), 'opening gallery file');
      });
    });
  });

  function loadInitialFile(cb) {
    var
      start, initGallery, initProcessor;

    start = function () {
      Filesystem.gather(Filesystem.DIR, initGallery);
    };

    initGallery = function (err, dir) {
      if (err) { return cb(err, dir); }
      if (dir) {
        gallery = new ImageGallery(dir, initProcessor);
      } else {
        Filesystem.gather(Filesystem.FILE, initProcessor);
      }
    };

    initProcessor = function (err, file) {
      if (err) { return cb(err); }
      if (file) {
        processor = new ImageProcessor(file, cb);
      } else {
        cb('No file');
      }
    };

    start();
  }

  displayText(null, 'loading retouch');

  loadInitialFile(uiProgress('loading initial image', updateInterface));

}());
