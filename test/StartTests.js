// Copyright (c) 2015 Heye Vöcking

/*global mocha:false */
/*global sinon:false */
/*global beforeEach:false */
/*global afterEach:false */
/*global describe:false */

var TEST = (function (parent) {
  'use strict';

  mocha.setup('bdd');

  // Sandbox testing environment
  beforeEach(function () {
    parent.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    parent.sandbox.restore();
  });

  parent.dbg = {
    printStack: function () {
      console.log(new Error().stack);
    }
  };

  describe('Main', parent.TestMain);
  describe('Filesystem', parent.TestFilesystem);
  describe('ImageProcessor', parent.TestImageProcessor);

  mocha.run();

  return parent;
}(TEST || {}));
