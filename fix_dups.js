const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');
// Remove old duplicate hooks after the new ones
const oldBlock = `  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user && user.full_name || "");
  const [editPhone, setEditPhone] = useState(user && user.phone || "");
  const [saving, setSaving] = useState(false);
  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("ks_token");
      await fetch("https://temboswift-backend.onrender.com/api/auth/me", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ full_name: editName, phone: editPhone }) });
      setSaving(false); setEditing(false); window.location.reload();
    } catch(e) { setSaving(false); }
  };`;
content = content.replace(oldBlock, '');
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
