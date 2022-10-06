'use strict';

const fs = require('fs');

function copy(fileNameIn, fileNameOut) {
    fs.copyFileSync(`./test/e2e/assets/${fileNameIn}`, `./test/e2e/generated/${fileNameOut}`);
}

module.exports = copy;
