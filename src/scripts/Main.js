// Copyright (c) 2015 Heye Vöcking

var RETOUCH = (function (parent) {
  'use strict';

  var
    Main = parent.Main = {},
    output = document.querySelector('output');

  function displayText(err, message) {
    var args, result;
    args = Array.apply(null, arguments).slice(2);
    if (err) {
      result = ['Error', message, '-', err];
    } else {
      result = ['Done', message];
    }
    result.concat(args);
    output.textContent = Array.apply(null, result).join(' ');
  }

  Main.initialize = function () {
    output = document.querySelector('output');

    displayText(null, 'initializing');
  };

  return parent;
}(RETOUCH || {}));
