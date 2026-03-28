const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
const lines = c.split('\n');
for(let i=138;i<165;i++) console.log((i+1)+':', JSON.stringify(lines[i]));
