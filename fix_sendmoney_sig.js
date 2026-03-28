const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');
// Fix function signature
c = c.replace(
  'export default function SendMoney({ user, onDone, setPage }) {',
  'export default function SendMoney({ user, onDone, setPage }) {'
);
// If still wrong fix it
if (!c.includes('function SendMoney({ user, onDone, setPage })')) {
  c = c.replace(
    /export default function SendMoney\([^)]*\)/,
    'export default function SendMoney({ user, onDone, setPage })'
  );
}
fs.writeFileSync('src/SendMoney.js', c, 'utf8');
// Verify
const line1 = c.split('\n').find(l => l.includes('function SendMoney'));
console.log('Function signature:', line1);
