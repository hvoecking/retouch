// Copyright (c) 2015 Heye Vöcking
// Inspired by https://github.com/ChrisJohnsen/StackOverflow-21896363/blob/so21896363/7/page.js

var RETOUCH = (function (parent) {
  'use strict';

  var Filesystem = parent.Filesystem = {};

  Filesystem.DIR = 'dir';
  Filesystem.FILE = 'file';

  Filesystem.open = function (entry, cb) {
    Filesystem.storeToLocalStorage(entry);
    entry.file(function (file) {
      cb(null, file, entry);
    });
  };

  function waitForIO(writer, callback) {
    // set a watchdog to avoid eventual locking:
    var start = Date.now();

    // wait for a few seconds
    function reentrant() {
      if (writer.readyState === writer.WRITING && Date.now() - start < 4000) {
        setTimeout(reentrant, 100);
        return;
      }
      if (writer.readyState === writer.WRITING) {
        console.error("Write operation taking too long, aborting!" +
          " (current writer readyState is " + writer.readyState + ")");
        writer.abort();
      } else {
        callback();
      }
    }
    setTimeout(reentrant, 100);
  }

  Filesystem.save = function (entry, blob, cb) {
    var
      init, onWrite, onError, onWriteEnd,
      writer;

    function start() {
      entry.createWriter(init, onError);
    }

    init = function (createdWriter) {
      writer = createdWriter;
      writer.onerror = onError;
      writer.onwriteend = onWriteEnd;
      writer.truncate(blob.size);

      waitForIO(writer, onWrite);
    };

    onWrite = function () {
      writer.seek(0);
      writer.write(blob);
    };

    onError = function (evt) {
      cb(evt.type + ": " + evt.code, evt);
    };

    onWriteEnd = function (evt) {
      cb(null, evt);
    };

    start();
  };

  Filesystem.storeToLocalStorage = function (entry) {
    try { // TODO remove try once retain is in stable.
      chrome.storage.local.set({
        chosenFile: chrome.fileSystem.retainEntry(entry)
      });
    } catch (ignore) {}
  };

  Filesystem.loadFromLocalStorage = function (cb) {
    chrome.storage.local.get('chosenFile', function (items) {
      if (items.chosenFile) {
        chrome.fileSystem.restoreEntry(items.chosenFile, function (file) {
          cb(null, file);
        });
      }
    });
  };

  Filesystem.userOpen = function (accepts, cb) {
    chrome.fileSystem.chooseEntry(
      {type: 'openFile', accepts: accepts},
      function (entry) {
        if (!entry) {
          return cb('No file selected.');
        }
        Filesystem.open(entry, cb);
      }
    );
  };

  Filesystem.userSave = function (content, cb) {
    chrome.fileSystem.chooseEntry({type: 'saveFile'}, function (entry) {
      if (!entry) { return cb('File is not accessible'); }
      Filesystem.save(entry, content, cb);
    });
  };

  return parent;
}(RETOUCH || {}));
