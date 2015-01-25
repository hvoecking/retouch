// Copyright (c) 2015 Heye Vöcking

/*global SortedSet:false */

/*global Filesystem:false */

function ImageGallery(dir, cb) {
  'use strict';

  var self = this;
  console.assert(dir, 'Directory is not valid');
  console.assert(dir.isDirectory, 'Expected a directory');
  self._dir = dir;
  self._fileEntries = null;
  self._filePaths = null;
  self._current = null;
  self._sortBy = null;
  self._update(function (err) {
    if (err) { return cb(err); }
    self._gather(function (err, fullPath) {
      if (err) { return cb(err); }
      if (!self._filePaths) { return cb('no files loaded'); }
      if (self._filePaths.length === 0) { return cb('no images found'); }
      var found = self._filePaths.findIterator(fullPath);
      if (found.value()) {
        self._setCurrent(found);
      } else {
        self._setCurrent(self._filePaths.beginIterator());
      }
      cb(null, self.current());
    });
  });
}

(function () {
  'use strict';
  var
    FULL_PATH = 'ImageGallery_fullPath';

  ImageGallery.prototype._update = function (cb) {
    var self = this, types, isImage;
    types = chrome.runtime.getManifest().file_handlers.image.types;
    isImage = function (name) {
      console.log(types, name);
      return _.find(types, function (type) {
        var ext = type.split('/')[1];
        console.log(ext, name, _.endsWith(name, ext));
        return _.endsWith(name.toLowerCase(), ext);
      });
    };

    Filesystem.listDir(self._dir, function (err, entries) {
      if (err) { return cb(err); }
      self._fileEntries = {};
      self._filePaths = new SortedSet({ comparator: function (a, b) {
        return a === b ? 0 : (a > b ? 1 : -1);
      }});
      self._setCurrent(self._filePaths.beginIterator());
      _.each(entries, function (file) {
        if (isImage(file)) {
          self._fileEntries[file.fullPath] = file;
          self._filePaths.insert(file.fullPath);
        }
      });
      cb();
    });
  };

  ImageGallery.prototype._setCurrent = function (iterator) {
    var self = this, entry;
    self._current = iterator;
    self._retain(iterator.value());
  };

  ImageGallery.prototype._retain = function (fullPath) {
    var obj = {};
    obj[FULL_PATH] = fullPath;
    try { // TODO remove try once retain is in stable.
      chrome.storage.local.set(obj);
    } catch (e) {
      console.err('Exception on storing entry', e);
    }
  };

  ImageGallery.prototype._gather = function (cb) {
    chrome.storage.local.get(FULL_PATH, function (obj) {
      cb(null, obj[FULL_PATH]);
    });
  };

  ImageGallery.prototype.copy = function (sourceFile, targetPath, cb) {
    var self = this;
    Filesystem.copy(self._dir, sourceFile, targetPath, cb);
  };

  ImageGallery.prototype.step = function (direction) {
    var self = this, iterator, steps;
    console.assert(direction === 1 || direction === -1);
    if (!self._current) { return null; }
    if (!self._filePaths
        || !self._filePaths.length
        || !self._fileEntries
        || !self._filePaths.length) {
      return null;
    }

    if (direction > 0) {
      if (!self._current.hasNext() || !self._current.next().value()) {
        iterator = self._filePaths.beginIterator();
      }
      iterator = self._current.next();
    } else if (direction < 0) {
      if (!self._current.hasPrevious()) {
        iterator = self._filePaths.endIterator();
      }
      iterator = self._current.previous();
    }
    if (self._setCurrent(iterator)) {
      return self.current();
    }
    return null;
  };

  ImageGallery.prototype.current = function () {
    var self = this;
    return self._fileEntries[self._current.value()];
  };

  ImageGallery.prototype.previous = function () {
    var self = this;
    return self.step(-1);
  };

  ImageGallery.prototype.next = function () {
    var self = this;
    return self.step(+1);
  };

}());
