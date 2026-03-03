const fs = require('fs');
const path = require('path');

// Copy ui.html to dist
const src = path.join(__dirname, '../src/ui.html');
const dest = path.join(__dirname, '../dist/ui.html');

fs.copyFileSync(src, dest);
console.log('UI copied to dist/ui.html');
