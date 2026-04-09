const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');

// Remove clientSecret condition from step 4
c = c.replace(
  '{step === 4 && clientSecret && (',
  '{step === 4 && ('
);

fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
