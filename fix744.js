const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');
lines[743] = 'function ManageCards({ user, onBack }) {';
c = lines.join('\n');
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Fixed');
