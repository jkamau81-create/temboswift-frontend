const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
const lines = c.split('\n');
// Remove lines 148-162 (index 147-161)
lines.splice(147, 15);
fs.writeFileSync('src/SendMoney.js', lines.join('\n'), 'utf8');
console.log('Done - removed old success screen');
