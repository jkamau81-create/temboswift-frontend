const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

// Update fee display in quote to show $0.00
content = content.replace(
  "'Transfer Fee', '\\$' + quote.fee_usd",
  "'Transfer Fee', 'Free'"
);
content = content.replace(
  '"Transfer Fee"',
  '"Transfer Fee 🎉"'
);

// Update fee in confirm step
content = content.replace(
  /Fee.*?quote\.fee_usd/g,
  'Fee", "Free'
);

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
