const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
c = c.replace('\n) {\n  const [card, setCard]', '\nfunction ManageCards({ user, onBack }) {\n  const [card, setCard]');
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Fixed');
