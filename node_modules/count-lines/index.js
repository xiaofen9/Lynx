/*!
 * count-lines <https://github.com/jonschlinkert/count-lines>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

(function () {
  'use strict';

  function count (str) {
    if (typeof str !== 'string') {
      throw new Error('count-lines expects a string.');
    }
    if (!str.length) {
      return 0;
    }
    return str.split(/\r?\n/g).length;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = count;
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return count;
      });
    } else {
      window.count = count;
    }
  }
})();
