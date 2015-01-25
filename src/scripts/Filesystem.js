// Copyright (c) 2015 Heye Vöcking
// Inspired by https://github.com/ChrisJohnsen/StackOverflow-21896363/blob/so21896363/7/page.js

/*global displayText:false */

var Filesystem = {};

(function () {
  'use strict';

  Filesystem.DIR = 'dir';
  Filesystem.FILE = 'file';

  Filesystem.listDir = function (root, cb) {
    Filesystem._listDir(root, null, 0, function (err, listing) {
      if (err) { return cb(err); }
      cb(null, listing);
    });
  };

  Filesystem._listDir = function (root, listing, depth, cb) {
    var
      reader, entries, offset, descentCount,
      start, init, more, process, push, onError;

    descentCount = 1;
    listing = listing || [];
    reader = root.createReader();

    start = function () {
      more = reader.readEntries.bind(reader, init, onError);
      more();
    };

    init = function (nextEntries) {
      entries = nextEntries;
      if (entries.length === 0) {
        descentCount -= 1;
        return (depth !== 0 || descentCount === 0) && cb(null, listing);
      }
      process(0);
    };

    process = function (current) {
      offset = current;
      _.each(entries.slice(offset), push);
      more();
    };

    push = function (ent, i) {
      listing.push(ent);
      if (ent.isDirectory) {
        var onDescent = process.bind(null, entries, offset + i + 1);
        descentCount += 1;
        return Filesystem._listDir(ent, listing, depth + 1, onDescent);
      }
    };

    onError = function () {
      console.error('error reading directory:', arguments);
    };

    start();
  };

  Filesystem.copy = function (root, srcFile, targetPath, cb) {
    var path, name;
    path = targetPath.split('/');
    name = path.pop();

    Filesystem.createDir(root, path, function (dir) {
      srcFile.copyTo(dir, name, function (entry) {
        cb(null, entry);
      }, cb);
    });
  };

  Filesystem.open = function (entry, cb) {
    entry.file(function (file) {
      Filesystem.retain(Filesystem.FILE, entry);
      cb(null, file, entry);
    });
  };

  function waitForIO(writer, callback) {
    var reentrant, start;

    // set a watchdog to avoid eventual locking:
    start = Date.now();

    // wait for a few seconds
    reentrant = function () {
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
    };
    setTimeout(reentrant, 100);
  }

  Filesystem.save = function (entry, blob, cb) {
    var
      writer,
      start, init, onWrite, onError, onWriteEnd;

    start = function () {
      entry.createWriter(init, onError);
    };

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

  Filesystem.retain = function (name, entry) {
    var obj = {};
    obj[name] = entry && chrome.fileSystem.retainEntry(entry);
    try { // TODO remove try once retain is in stable.
      chrome.storage.local.set(obj);
    } catch (e) {
      console.err('Exception on storing entry', e);
    }
  };
  Filesystem.gather = function (name, cb) {
    chrome.storage.local.get(name, function (obj) {
      if (obj[name]) {
        chrome.fileSystem.restoreEntry(obj[name], function (entry) {
          cb(null, entry);
        });
      } else {
        cb();
      }
    });
  };

  Filesystem.userOpenDir = function (cb) {
    chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (entry) {
      if (!entry) {
        return cb('Directory is not accessible');
      }
      if (!entry.isDirectory) {
        return cb('Expected directory, but got ' + JSON.stringify(entry));
      }
      Filesystem.retain(Filesystem.FILE, null);
      Filesystem.retain(Filesystem.DIR, entry);
      cb(null, entry);
    });
  };

  Filesystem.userOpen = function (cb) {
    chrome.fileSystem.chooseEntry(
      {type: 'openFile', accepts: null},
      function (entry) {
        if (!entry) { return cb('No file selected.'); }
        Filesystem.retain(Filesystem.DIR, null);
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

}());
