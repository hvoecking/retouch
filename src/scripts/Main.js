// Copyright (c) 2015 Heye Vöcking

/*global FileAPI:false */
/*global ImageProcessor:false */

/*global PresetFilters:false */
/*global output_canvas:false */
/*global output_div:false */

/*global Filesystem:false */
/*global ImageProcessor:false */
/*global launchData:false */

(function () {
  'use strict';

  var
    chooseFileButton = document.querySelector('#choose_file'),
    saveFileAsButton = document.querySelector('#save_file_as'),
    discardButton = document.querySelector('#discard'),
    acceptButton = document.querySelector('#accept'),
    undoButton = document.querySelector('#undo'),
    redoButton = document.querySelector('#redo'),
    output = document.querySelector('output'),
    processor = null;

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
    saveFileAsButton.disabled = !processor;
    acceptButton.disabled = !processor.canAccept();
    discardButton.disabled = !processor.canAccept();
    undoButton.disabled = !processor.canUndo();
    redoButton.disabled = !processor.canRedo();
    processor.render(cb);
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
    // TODO: Load from manifest
    var onLoad = uiProgress('choosing file', updateInterface);
    processor = new ImageProcessor(null, onLoad);
  });

  function loadInitialFile(launchData) {
    var onLoad = uiProgress('loading initial file', updateInterface);
    if (launchData && launchData.items && launchData.items[0]) {
      processor = new ImageProcessor(launchData.items[0].entry, onLoad);
    } else {
      Filesystem.loadFromLocalStorage(function (err, entry) {
        if (err) { return displayText(err, 'loading initial file'); }
        if (entry) {
          processor = new ImageProcessor(entry, onLoad);
        }
      });
    }
  }

  displayText(null, 'loading retouch');

  loadInitialFile(launchData);

}());
