'use strict';

exports.shouldSkipPath = function(projection, path) {
  if (projection.$inclusive) {
    return projection[path] != null;
  } else {
    const parts = path.split('.');
    let cur = parts[0];
    for (let i = 0; i < parts.length - 1; ++i) {
      if (projection[cur] != null) {
        return false;
      }
      cur += '.' + parts[i + 1];
    }
    return projection[path] == null && projection.$hasExclusiveChild[path] == null;
  }
}
