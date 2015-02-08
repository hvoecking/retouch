// Copyright (c) 2015 Heye Vöcking

/*global chai:false */
/*global mocha:false */
/*global describe:false */
/*global it:false */
/*global sinon:false */
/*global beforeEach:false */
/*global afterEach:false */
/*global displayText:false */
/*global Main:false */

(function () {
  'use strict';

  chrome.app.runtime = {
    onLaunched: {
      addListener: function (listener) {
        listener();
      }
    }
  };

  chrome.app.window = {
    create: sinon.spy()
  };

  sinon.stub(document, "querySelector").withArgs('output').returns({});

}());
