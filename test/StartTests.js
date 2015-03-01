// Copyright (c) 2015 Heye Vöcking

/*global mocha:false */
/*global sinon:false */
/*global chai:false */
/*global beforeEach:false */
/*global afterEach:false */
/*global describe:false */

var expect = chai.expect;

var TEST = (function (parent) {
  'use strict';

  mocha.setup('bdd');

  beforeEach(function () {
    // create a sandbox
    parent.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    // restore the environment as it was before
    parent.sandbox.restore();
  });

  describe('Main', parent.TestMain);

  mocha.run();

  return parent;
}(TEST || {}));
