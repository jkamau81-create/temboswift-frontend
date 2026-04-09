const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Fix broken emoji encoding
c = c.replace(/ðŸ"‹/g, '📋');
c = c.replace(/ðŸ¤³/g, '🤳');
c = c.replace(/âœ…/g, '✅');
c = c.replace(/â€"/g, '—');
c = c.replace(/ðŸ†"/g, '🆓');

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Encoding fixed');
