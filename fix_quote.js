const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');

// Change debounce from 500ms to 300ms
c = c.replace('}, 500);', '}, 300);');

// Also ensure amount >= 1 not > 5
c = c.replace('if (!amt || amt < 5)', 'if (!amt || amt < 1)');
c = c.replace('if (!amt || amt < 1) { setQuote(null)', 'if (!amt || amt < 0.5) { setQuote(null)');

fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
