// Copyright (c) 2015 Heye Vöcking

var RETOUCH = (function (parent) {
  'use strict';

  var Filters = parent.Filters = {};

  Filters.register = function (globals) {
    // nofilter Filter
    parent.Caman.Filter.register("nofilter", function () {
      // Doing nofilter operation
      return;
    });
  };

  return parent;
}(RETOUCH || {}));
