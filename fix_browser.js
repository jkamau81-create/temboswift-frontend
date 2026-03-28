const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
c = c.replace(
  "import CardManager from \"./CardManager\";",
  `import CardManager from "./CardManager";
// Browser detection helper
const isEdge = typeof navigator !== 'undefined' && navigator.userAgent.includes('Edg/');`
);
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
