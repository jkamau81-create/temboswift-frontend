const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const lines = c.split('\n');

// Replace lines 823-829 with text only logo
lines[822] = '      <div style={{ background: G.green, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>';
lines[823] = '        <div>';
lines[824] = '          <span style={{ fontFamily: "\'Playfair Display\', serif", fontSize: 24, fontWeight: 900, color: "#ffffff" }}>Tembo</span>';
lines[825] = '          <span style={{ fontFamily: "\'Playfair Display\', serif", fontSize: 24, fontWeight: 900, color: "#f5a623" }}>Swift</span>';
lines[826] = '        </div>';
lines[827] = '';
lines[828] = '';

c = lines.join('\n');
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
