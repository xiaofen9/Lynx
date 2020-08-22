var dts = require('dts-bundle');
var path = require('path');

dts.bundle({
    name: 'math-interval-parser',
    main: path.join('lib', 'index.d.ts')
});
