const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
c = c.replace(
  'if (d.url) window.open(d.url, "_blank");',
  'if (d.url) window.location.href = d.url;'
);
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
