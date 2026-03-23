const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

// Find the second occurrence of saveProfile and remove everything from [editing to end of that saveProfile block
const firstSaveProfile = content.indexOf('const saveProfile');
const secondSaveProfile = content.indexOf('const saveProfile', firstSaveProfile + 1);

if (secondSaveProfile === -1) {
  console.log('No duplicate saveProfile found');
  process.exit(0);
}

// Find start of the duplicate block (const [editing...)
const editingIdx = content.lastIndexOf('const [editing', secondSaveProfile);
// Find end of the duplicate block (the closing }; after saveProfile)
const blockEnd = content.indexOf('};', secondSaveProfile) + 2;

console.log('Removing duplicate from index', editingIdx, 'to', blockEnd);
content = content.substring(0, editingIdx) + content.substring(blockEnd);
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
