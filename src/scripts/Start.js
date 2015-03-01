// Copyright (c) 2015 Heye Vöcking

/*global PresetFilters:false */
/*global output_canvas:false */
/*global output_div:false */
/*global launchData:false */

/*global FileAPI:false */
/*global Caman:false */

/*global Filters:false */
/*global ImageProcessor:false */
/*global Main:false */

var RETOUCH = (function (parent) {
  'use strict';

  var Doc = parent.Doc = parent.Doc || {};
  Doc.presetFilters = PresetFilters;
  Doc.outputCanvas = output_canvas;
  Doc.outputDiv = output_div;

  parent.FileAPI = FileAPI;
  parent.Caman = Caman;

  parent.dbg = {
    printStack: function () {
      console.log(new Error().stack);
    }
  };

  parent.Filters.register();
  parent.Main.initialize();
  parent.Main.loadInitialFile(launchData);

  return parent;
}(RETOUCH || {}));
