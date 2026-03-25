const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');
c = c.replace(
  `  // Admin route\n  if (typeof window !== "undefined" && window.location.pathname === "/admin") {\n    return null; // Admin handled separately\n  }\n\n  useEffect`,
  `  useEffect`
);
fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Fixed');
