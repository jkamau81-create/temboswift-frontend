const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Fix legal links to open properly
c = c.replace(
  'onClick={() => window.open(url)}',
  'onClick={() => window.open(url, "_blank")}'
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
