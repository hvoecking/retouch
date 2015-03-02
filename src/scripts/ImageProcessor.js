// Copyright (c) 2015 Heye Vöcking

var RETOUCH = (function (parent) {
  'use strict';

  var ImageProcessor = parent.ImageProcessor =
    function (entry, cb) {
      var self = this;
      self._originalEntry = null;
      self._originalFile = null;
      self._preview = null;
      self._filtersUndoStack = [];
      self._filtersRedoStack = [];
      self.processing = false;
      self.canvas = null;
      self.load(entry, cb);
    };


  ImageProcessor.prototype.load = function (entry, cb) {
    var onOpen,
      self = this;

    function start() {
      if (entry) {
        parent.Filesystem.open(entry, onOpen);
      } else {
        parent.Filesystem.userOpen(null, onOpen);
      }
    }

    onOpen = function (err, file, entry) {
      if (err) { return cb(err); }

      self._originalFile = file;
      self._originalEntry = entry;
      var img = parent.FileAPI.Image(file);
      // TODO: find out proper size
      img.resize(300, 'max');
      img.get(function (err, canvas) {
        self.canvas = canvas;
        cb(err, canvas);
      });
    };

    start();
  };

  function dataURItoBlob(dataURI) {
    // adapted from:
    // http://stackoverflow.com/questions/6431281/save-png-canvas-image-to-html5-storage-javascript
    var
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs
      byteString = atob(dataURI.split(',')[1]),
      // separate out the mime component
      mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0],
      // write the bytes of the string to an ArrayBuffer
      ab = new ArrayBuffer(byteString.length),
      ia = new Uint8Array(ab),
      i,
      blob;

    for (i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    blob = new Blob([ia], { "type": mimeString });
    return blob;
  }

  ImageProcessor.prototype.store = function (entry, cb) {
    var applyFilters, saveImage,
      self = this,
      image,
      blob;

    // If modified: Load original file and apply all changes, save it including the exif data + modified tag to disk
    function start() {
      parent.FileAPI.Image(self._originalFile)
        .get(function (err, canvas) {
          if (err) { return cb(err); }
          image = canvas;
          applyFilters();
        });
    }

    applyFilters = function () {
      parent.Caman(image, function () {
        self.accept();
        self.apply(this);
        this.render(saveImage);
      });
    };

    saveImage = function () {
      blob = dataURItoBlob(image.toDataURL());
      if (entry) {
        parent.Filesystem.save(entry, blob, cb);
      } else {
        parent.Filesystem.userSave(blob, cb);
      }
    };

    start();
  };

  ImageProcessor.prototype.render = function (cb) {
    var self = this;
    if (!self.canvas) {
      return cb('No image loaded');
    }
    parent.Caman(self.canvas, function () {
      this.revert();
      self.apply(this);
      this.render(function () {
        if (cb) {
          cb(null, self.canvas);
        }
      });
    });
  };

  function apply(caman, filter) {
    var CamanObj = caman; // Hack to get jslint working (Unexpected 'call')
    CamanObj[filter.func].call(caman, filter.args);
  }

  ImageProcessor.prototype.apply = function (caman) {
    var self = this;
    _.each(self._filtersUndoStack, function (filter) {
      apply(caman, filter);
    });
    if (self._preview) {
      apply(caman, self._preview);
    }
  };

  ImageProcessor.prototype.preview = function (func, args) {
    var self = this;
    self._preview = {func: func, args: args || []};
  };

  ImageProcessor.prototype.canAccept = function () {
    var self = this;
    return !!self._preview;
  };

  ImageProcessor.prototype.accept = function () {
    var self = this;
    if (!self.canAccept()) { return; }
    // TODO: If needed backup original image, write changes to file exif data
    self._filtersUndoStack.push(self._preview);
    self._filtersRedoStack = [];
    self._preview = null;
  };

  ImageProcessor.prototype.discard = function () {
    var self = this;
    if (!self.canAccept()) { return; }
    self._preview = null;
  };

  ImageProcessor.prototype.canUndo = function () {
    var self = this;
    return !!self._filtersUndoStack.length;
  };

  ImageProcessor.prototype.canRedo = function () {
    var self = this;
    return !!self._filtersRedoStack.length;
  };

  ImageProcessor.prototype.undo = function () {
    var self = this;
    if (!self.canUndo()) { return; }
    self._filtersRedoStack.push(self._filtersUndoStack.pop());
  };

  ImageProcessor.prototype.redo = function () {
    var self = this;
    if (!self.canRedo()) { return; }
    self._filtersUndoStack.push(self._filtersRedoStack.pop());
  };

  return parent;
}(RETOUCH || {}));
