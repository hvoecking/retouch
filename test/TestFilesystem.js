// Copyright (c) 2015 Heye Vöcking

/*global sinon:false */
/*global chai:false */
/*global it:false */

/*global RETOUCH:false */

var TEST = (function (parent, retouch) {
  'use strict';

  parent.TestFilesystem = function () {
    it('should load when calling loadFromLocalStorage', function () {
      var expectedFile, expectedEntry, onLoad;
      expectedFile = {};
      expectedEntry = {};
      chrome.storage.local.get = parent.sandbox.spy();
      chrome.fileSystem = {restoreEntry: parent.sandbox.spy()};
      onLoad = parent.sandbox.spy();

      retouch.Filesystem.loadFromLocalStorage(onLoad);
      chrome.storage.local.get.callArg(1, {chosenFile: expectedFile});
      chrome.fileSystem.restoreEntry.callArg(1, expectedFile);

      sinon.assert.calledOnce(chrome.storage.local.get);
      sinon.assert.calledWith(chrome.storage.local.get, 'chosenFile');
      sinon.assert.calledOnce(chrome.fileSystem.restoreEntry);
      sinon.assert.calledWith(chrome.fileSystem.restoreEntry, sinon.match.same(expectedFile));
      sinon.assert.calledOnce(onLoad);
      // FIXME: Error: Failed to read the 'sessionStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag.
      //  sinon.assert.calledWith(onLoad, expectedFile);
    });

    var expectedFile, expectedEntry;
    function setup() {
      var expectedRetainedEntry, expectedSetEntry;
      expectedRetainedEntry = {};
      expectedSetEntry = {chosenFile: expectedRetainedEntry};
      expectedFile = {};
      chrome.storage.local.set = parent.sandbox.spy();
      chrome.fileSystem = {
        retainEntry: parent.sandbox.stub().returns(expectedRetainedEntry)
      };
      expectedEntry = {file: parent.sandbox.spy()};
      return function () {
        sinon.assert.calledOnce(chrome.fileSystem.retainEntry);
        sinon.assert.calledWith(chrome.fileSystem.retainEntry, sinon.match.same(expectedEntry));
        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWith(chrome.storage.local.set, expectedSetEntry);
      };
    }
    it('should store to local storage when calling storeToLocalStorage', function () {
      var check = setup();
      retouch.Filesystem.storeToLocalStorage(expectedEntry);
      check();
    });
    it('should store to local storage when calling open', function () {
      var check;
      check = setup();
      retouch.Filesystem.open(expectedEntry, parent.sandbox.spy());
      expectedEntry.file.callArg(0, expectedFile);
      check();
    });
    it('should store to local storage when calling userOpen', function () {
      var onOpen, check;
      check = setup();
      onOpen = parent.sandbox.spy();
      chrome.fileSystem.chooseEntry = parent.sandbox.spy(function (options, cb) {
        // TODO: Sinonify
        chai.assert.equal(options.type, 'openFile');
        chai.assert.notEqual(options.accepts.length, 0);
        cb(expectedEntry);
      });
      retouch.Filesystem.userOpen(expectedEntry, onOpen);
      check();
      expectedEntry.file.callArg(0, expectedFile);
      sinon.assert.calledOnce(onOpen);
      sinon.assert.calledWith(onOpen, null, sinon.match.same(expectedFile));
    });
  };

  return parent;
}(TEST || {}, RETOUCH));

