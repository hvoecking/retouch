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

  var expect = chai.expect;
  mocha.setup('bdd');

  describe("Background.js", function () {
    var sandbox;

    beforeEach(function () {
      // create a sandbox
      sandbox = sinon.sandbox.create();

      // stub some console methods
      sandbox.stub(window.console, "log");
      sandbox.stub(window.console, "error");
    });

    afterEach(function () {
      // restore the environment as it was before
      sandbox.restore();
    });

    describe("window.create", function () {
      it("should call window.create", function () {
        sinon.assert.calledOnce(chrome.app.window.create);
      });
    });
  });

  mocha.run();
}());
