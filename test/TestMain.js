// Copyright (c) 2015 Heye Vöcking

/*global sinon:false */
/*global it:false */

/*global RETOUCH:false */

var TEST = (function (parent, retouch) {
  'use strict';

  parent.TestMain = function () {
    it('should install all listeners', function () {
      var
        mockQuerySelector = parent.sandbox.stub(document, 'querySelector');

      mockQuerySelector.withArgs('output').returns({});

      retouch.Main.initialize();

      sinon.assert.calledOnce(mockQuerySelector);
    });
  };

  return parent;
}(TEST || {}, RETOUCH));
