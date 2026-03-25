const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
// Print lines 870-895
for(let i=869;i<895;i++) console.log((i+1)+':', lines[i]);
