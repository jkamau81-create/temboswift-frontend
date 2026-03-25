const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
console.log('Lines 740-748:');
for(let i=739;i<748;i++) console.log((i+1)+':', JSON.stringify(lines[i]));
