// Copyright (c) 2015 Heye Vöcking

var RETOUCH = (function (parent) {
  'use strict';

  var
    Doc = parent.Doc = parent.Doc || {},
    Main = parent.Main = {},
    chooseFileButton,
    saveFileAsButton,
    discardButton,
    acceptButton,
    undoButton,
    redoButton,
    output,
    processor;

  function displayText(err, message) {
    var
      args = Array.apply(null, arguments).slice(2),
      result;

    if (err) {
      result = ['Error', message, '-', err];
    } else {
      result = ['Done', message];
    }
    result.concat(args);
    output.textContent = Array.apply(null, result).join(' ');
  }

  function uiProgress(message, cb) {
    Doc.outputCanvas.innerHTML = '<div class="loader"></div>';
    Doc.outputDiv.style.display = '';
    return function (err, canvas) {
      if (err) {
        return cb(err, message);
      }

      Doc.outputCanvas.innerHTML = '';
      Doc.outputCanvas.appendChild(canvas);

      if (processor && processor.processing) {
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
    acceptButton.disabled = !processor || !processor.canAccept();
    discardButton.disabled = !processor || !processor.canAccept();
    undoButton.disabled = !processor || !processor.canUndo();
    redoButton.disabled = !processor || !processor.canRedo();
    if (processor) {
      processor.render(cb);
    }
  }

  function selectPresetFilter(el) {
    var
      filter = el.dataset.preset,
      lastActiveNode;

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

  Main.initialize = function () {
    output = document.querySelector('output');

    displayText(null, 'initializing');
    // Set filter
    parent.FileAPI.event.on(Doc.presetFilters, 'click', function (evt) {
      selectPresetFilter(evt.target);
    });

    chooseFileButton = document.querySelector('#choose_file');
    chooseFileButton.addEventListener('click', function () {
      // TODO: Load from manifest
      var onLoad = uiProgress('choosing file', updateInterface);
      processor = new parent.ImageProcessor(null, onLoad);
    });

    saveFileAsButton = document.querySelector('#save_file_as');
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

    discardButton = document.querySelector('#discard');
    discardButton.addEventListener('click', function () {
      processor.discard();
      updateInterface(null, 'discard');
    });

    acceptButton = document.querySelector('#accept');
    acceptButton.addEventListener('click', function () {
      processor.accept();
      updateInterface(null, 'accept');
    });

    undoButton = document.querySelector('#undo');
    undoButton.addEventListener('click', function () {
      processor.undo();
      updateInterface(null, 'undo');
    });

    redoButton = document.querySelector('#redo');
    redoButton.addEventListener('click', function () {
      processor.redo();
      updateInterface(null, 'redo');
    });
  };

  Main.loadInitialFile = function (launchData) {
    var onLoad = uiProgress('loading initial file', function () {
      parent.dbg.printStack();
      console.log('called with:', arguments);
    });
    if (launchData && launchData.items && launchData.items[0]) {
      processor = new parent.ImageProcessor(launchData.items[0].entry, onLoad);
    } else {
      parent.Filesystem.loadFromLocalStorage(function (err, entry) {
        if (err) { return displayText(err, 'loading initial file'); }
        if (entry) {
          // The processor will only be available after the constructor
          // has returned, so we have to call updateInterface not onLoad,
          // but afterwards
          processor = new parent.ImageProcessor(entry, onLoad);
          updateInterface(null, 'loading initial file', onLoad);
        }
      });
    }
  };

  return parent;
}(RETOUCH || {}));
