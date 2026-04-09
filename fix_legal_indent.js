const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
// Fix line 655 (index 655) - remove extra indentation
lines[655] = lines[655].replace('    if (section === "legal")', '  if (section === "legal")');
c = lines.join('\n');
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Fixed - line:', lines[655]);
