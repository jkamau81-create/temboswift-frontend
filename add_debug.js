const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
c = c.replace(
  'setTransferData(result.transfer);',
  'console.log("Transfer result:", result); setTransferData(result.transfer);'
);
c = c.replace(
  'setClientSecret(result.clientSecret);',
  'console.log("Client secret:", result.clientSecret); setClientSecret(result.clientSecret);'
);
fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
