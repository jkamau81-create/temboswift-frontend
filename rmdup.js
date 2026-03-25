const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
const first = c.indexOf('function ManageCards(');
const second = c.indexOf('function ManageCards(', first + 1);
if (second !== -1) {
  // Find end of second ManageCards
  let braces = 0, i = second, started = false;
  while (i < c.length) {
    if (c[i] === '{') { braces++; started = true; }
    if (c[i] === '}') braces--;
    if (started && braces === 0) { i++; break; }
    i++;
  }
  c = c.substring(0, second) + c.substring(i);
  console.log('Removed duplicate ManageCards');
} else { console.log('No duplicate found'); }
fs.writeFileSync('src/App.js', c, 'utf8');
