const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');

// Remove the old success screen that comes after Receipt
const marker = `  );
   return (
    <div style={{ textAlign: "center", padding: "48px 20px", fontFamily: G.font }}>`;

const endMarker = `  );

  return (
    <div style={{ fontFamily: G.font, maxWidth: 480 }}>`;

const start = c.indexOf(marker);
const end = c.indexOf(endMarker);

if (start !== -1 && end !== -1) {
  c = c.substring(0, start + 4) + '\n\n' + c.substring(end);
  console.log('Removed old success screen');
} else {
  console.log('Markers not found:', start, end);
}

fs.writeFileSync('src/SendMoney.js', c, 'utf8');
