const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
// Check lines around 822-828
for(let i=820;i<830;i++) console.log((i+1)+':', lines[i]);
