const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
c = c.replace(
  /const stripePromise = loadStripe\([^)]+\);/,
  'const stripePromise = loadStripe("pk_live_51T6QLQGZ5hG9oDBuQCrGqyDiBr2yW4uAhx7fZ8xZE6S6qglqvRluTzV2mLg08780HkeyYiZaTPSKq6gYtHok80Hq00w6fVLRD8");'
);
fs.writeFileSync('src/SendMoney.js', c, 'utf8');
// verify
const line = c.split('\n').find(l => l.includes('stripePromise'));
console.log('Key line:', line);
