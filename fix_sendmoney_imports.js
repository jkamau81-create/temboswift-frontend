const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
// Remove wrong imports
c = c.replace('import CardManager from "./CardManager";\nimport SendMoney from "./SendMoney";\n', '');
c = c.replace('import CardManager from "./CardManager";\r\nimport SendMoney from "./SendMoney";\r\n', '');
fs.writeFileSync('src/SendMoney.js', c, 'utf8');
// Check first 5 lines
console.log(c.split('\n').slice(0,5).join('\n'));
