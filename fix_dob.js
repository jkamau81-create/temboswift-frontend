const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');
// Fix fields initialization to use saved values from user
content = content.replace(
  'const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", address: (user && user.address) || "", date_of_birth: (user && user.date_of_birth) || "" });',
  'const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", address: (user && user.address) || "", date_of_birth: (user && user.date_of_birth ? user.date_of_birth.substring(0,10) : "") });'
);
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
