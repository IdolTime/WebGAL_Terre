const fs = require('fs-extra');

// 复制 src/utils/rcedit 文件夹到 dist/utils/rcedit
fs.copySync('./src/util/rcedit', './dist/util/rcedit');
console.log('rcedit Files copied successfully!');
