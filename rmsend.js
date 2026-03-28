const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const start = c.indexOf('// ── SEND MONEY ─────────────────────────────────────────────────────────────');
const end = c.indexOf('// ── RECIPIENTS ─────────────────────────────────────────────────────────────');
if (start !== -1 && end !== -1) {
  c = c.substring(0, start) + c.substring(end);
  console.log('Removed old SendMoney');
} else { console.log('Not found:', start, end); }
fs.writeFileSync('src/App.js', c, 'utf8');
