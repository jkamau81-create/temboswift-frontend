const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
// Remove Crisp script entirely
c = c.replace(/window\.\$crisp[\s\S]*?<\/script>/g, '');
c = c.replace(/<script>window\.CRISP_WEBSITE_ID[\s\S]*?<\/script>/g, '');
fs.writeFileSync('public/index.html', c, 'utf8');
console.log('Crisp removed');
