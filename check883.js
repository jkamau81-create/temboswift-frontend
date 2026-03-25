const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
console.log('Line 883:', lines[882]);
