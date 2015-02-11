// Copyright (c) 2015 Heye Vöcking

(function () {
  'use strict';

  var output = document.querySelector('output');

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

  displayText(null, 'loading retouch');

}());
