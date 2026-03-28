const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
console.log('File length:', c.length);
console.log('Last 200 chars:', c.slice(-200));
