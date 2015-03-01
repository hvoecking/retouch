// Copyright (c) 2015 Heye Vöcking

/*global chai:false */
/*global sinon:false */
/*global it:false */

/*global RETOUCH:false */

var TEST = (function (parent, retouch) {
  'use strict';

  parent.TestImageProcessor = function () {

    function mockImageProcessor() {
      parent.sandbox.stub(retouch.ImageProcessor.prototype, 'load');
      return new retouch.ImageProcessor();
    }

    it('should load the image on construction', function () {
      var processor = mockImageProcessor();
      sinon.assert.calledOnce(processor.load);
    });

    it('should load the image', function () {
      var
        expectedCanvas = {},
        expectedFile = {},
        expectedEntry = {file: parent.sandbox.spy()},
        expectedImage,
        onLoad;

      expectedImage = {
        resize: parent.sandbox.spy(),
        get: parent.sandbox.spy()
      };
      retouch.FileAPI = {
        Image: parent.sandbox.stub().returns(expectedImage)
      };
      onLoad = parent.sandbox.spy(function (err, actualCanvas) {
        // TODO: Sinonify
        chai.assert.isNull(err);
        chai.assert.equal(expectedCanvas, actualCanvas);
      });

      retouch.ImageProcessor.prototype.load(expectedEntry, onLoad);
      expectedEntry.file.callArg(0, expectedFile);
      expectedImage.get.callArg(0, null, expectedCanvas);

      sinon.assert.calledOnce(retouch.FileAPI.Image);
      sinon.assert.calledWith(retouch.FileAPI.Image, expectedFile);
      sinon.assert.calledOnce(expectedImage.resize);
      sinon.assert.calledOnce(expectedImage.get);
      sinon.assert.calledOnce(onLoad);
    });

    it('should store the image', function () {
      var
        processor = mockImageProcessor(),
        mockFile = {},
        mockEntry = {},
        mockCanvas = {},
        mockImage = {get: parent.sandbox.spy()},
        mockRenderer = parent.sandbox.spy();


      processor._originalFile = mockFile;

      retouch.FileAPI = {
        Image: parent.sandbox.stub()
      };
      retouch.FileAPI.Image.returns(mockImage);
      retouch.Caman = parent.sandbox.spy(function (ignore, cb) {
        // Since Caman does some nasty stuff internally, we have to imitate
        // that behaviour here:
        cb.call({render: mockRenderer});
      });
      retouch.dbg = parent.dbg;

      processor.store(mockEntry, parent.sandbox.spy());
      sinon.assert.calledOnce(mockImage.get);
      mockImage.get.callArg(0, null, mockImage);
      sinon.assert.calledOnce(mockRenderer);
      sinon.assert.calledWith(retouch.Caman, sinon.match.same(mockImage));
    });

    it('should render the image', function () {
      retouch.Caman = parent.sandbox.spy(function (canvas, cb) {
        // Don't call the cb
      });
      retouch.ImageProcessor.prototype.render();
      sinon.assert.calledOnce(retouch.Caman);
    });

    it('should accept', function () {
      var processor = mockImageProcessor();
      chai.assert.isFalse(processor.canAccept());
      processor.preview();
      chai.assert.isTrue(processor.canAccept());
      processor.accept();
      chai.assert.isFalse(processor.canAccept());
    });

    it('should discard', function () {
      var processor = mockImageProcessor();
      chai.assert.isFalse(processor.canAccept());
      processor.preview();
      chai.assert.isTrue(processor.canAccept());
      processor.discard();
      chai.assert.isFalse(processor.canAccept());
    });

    it('should do and undo', function () {
      var processor = mockImageProcessor();
      processor.preview();
      chai.assert.isFalse(processor.canUndo());
      processor.accept();
      chai.assert.isTrue(processor.canUndo());
      processor.undo();
      chai.assert.isFalse(processor.canUndo());
    });

    it('should do do and undo undo', function () {
      var processor = mockImageProcessor();
      processor.preview();
      chai.assert.isFalse(processor.canUndo());
      processor.accept();
      chai.assert.isTrue(processor.canUndo());
      processor.preview();
      processor.accept();
      processor.undo();
      chai.assert.isTrue(processor.canUndo());
      processor.undo();
      chai.assert.isFalse(processor.canUndo());
    });

    it('should do undo redo', function () {
      var processor = mockImageProcessor();
      processor = new retouch.ImageProcessor();
      processor.preview();
      chai.assert.isFalse(processor.canRedo());
      processor.accept();
      chai.assert.isFalse(processor.canRedo());

      processor.undo();
      chai.assert.isTrue(processor.canRedo());

      processor.redo();
      chai.assert.isFalse(processor.canRedo());
    });

    it('should do do undo redo undo undo redo redo', function () {
      var processor = mockImageProcessor();
      processor.preview();
      chai.assert.isFalse(processor.canRedo());
      processor.accept();
      chai.assert.isFalse(processor.canRedo());

      processor.preview();
      chai.assert.isFalse(processor.canRedo());
      processor.accept();
      chai.assert.isFalse(processor.canRedo());

      processor.undo();
      chai.assert.isTrue(processor.canRedo());

      processor.redo();
      chai.assert.isFalse(processor.canRedo());

      processor.undo();
      chai.assert.isTrue(processor.canRedo());

      processor.undo();
      chai.assert.isTrue(processor.canRedo());

      processor.redo();
      chai.assert.isTrue(processor.canRedo());

      processor.redo();
      chai.assert.isFalse(processor.canRedo());
    });

    it('should apply', function () {
      var
        expectedArgs1 = [],
        expectedArgs2 = [],
        processor = mockImageProcessor();

      retouch.Caman = {
        mockFilter1: parent.sandbox.spy(),
        mockFilter2: parent.sandbox.spy()
      };

      processor.preview('mockFilter1', expectedArgs1);
      processor.apply(retouch.Caman);
      sinon.assert.calledOnce(retouch.Caman.mockFilter1);

      processor.accept();
      processor.apply(retouch.Caman);
      sinon.assert.calledTwice(retouch.Caman.mockFilter1);

      processor.preview('mockFilter2', expectedArgs2);
      processor.apply(retouch.Caman);
      sinon.assert.calledOnce(retouch.Caman.mockFilter2);
      chai.assert(retouch.Caman.mockFilter2.calledAfter(retouch.Caman.mockFilter1));
      sinon.assert.calledThrice(retouch.Caman.mockFilter1);

      sinon.assert.alwaysCalledWith(retouch.Caman.mockFilter1, sinon.match.same(expectedArgs1));
      sinon.assert.alwaysCalledWith(retouch.Caman.mockFilter2, sinon.match.same(expectedArgs2));
    });
  };

  return parent;
}(TEST || {}, RETOUCH));
