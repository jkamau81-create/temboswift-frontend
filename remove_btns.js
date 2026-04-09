const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');

// Remove quick amount buttons
c = c.replace(
  /<div style=\{\{ display: "flex", gap: 8 \}\}>\s*\{.*?\[50, 100, 200, 500, 1000\][\s\S]*?<\/div>\s*<\/div>/,
  '</div>'
);

fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
