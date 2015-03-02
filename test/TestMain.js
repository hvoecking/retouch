// Copyright (c) 2015 Heye Vöcking

/*global sinon:false */
/*global it:false */

/*global RETOUCH:false */

var TEST = (function (parent, retouch) {
  'use strict';

  parent.TestMain = function () {
    it('should install all listeners', function () {
      var
        mockButton = {addEventListener: parent.sandbox.spy()},
        mockQuerySelector = parent.sandbox.stub(document, 'querySelector');

      mockQuerySelector.withArgs('output').returns({});
      mockQuerySelector.returns(mockButton);
      retouch.FileAPI = {
        event: {
          on: parent.sandbox.spy()
        }
      };

      retouch.Main.initialize();

      sinon.assert.calledWith(mockQuerySelector, '#choose_file');
      sinon.assert.calledWith(mockQuerySelector, '#save_file_as');
      sinon.assert.calledWith(mockQuerySelector, '#discard');
      sinon.assert.calledWith(mockQuerySelector, '#accept');
      sinon.assert.calledWith(mockQuerySelector, '#undo');
      sinon.assert.calledWith(mockQuerySelector, '#redo');
      sinon.assert.callCount(mockQuerySelector, 7);
      sinon.assert.callCount(mockButton.addEventListener, 6);
      sinon.assert.calledOnce(retouch.FileAPI.event.on);
      sinon.assert.calledWith(retouch.FileAPI.event.on, sinon.match.same(retouch.PresetFilters));
    });
  };

  return parent;
}(TEST || {}, RETOUCH));
