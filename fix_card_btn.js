const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');
content = content.replace(
  `  const addCard = async () => {
    setSaving(true);
    try {
      const d = await api.setupCard();
      const url = "https://checkout.stripe.com/c/pay/" + d.client_secret;
      window.open(url, "_blank");
      setSaving(false);
      setShowAdd(false);
    } catch(e) { setSaving(false); alert(e.message); }
  };`,
  `  const addCard = async () => {
    setSaving(true);
    try {
      const d = await api.setupCard();
      setSaving(false);
      alert("Card setup initiated! In production this will open Stripe card entry. For now contact support@temboswift.com to add your card.");
    } catch(e) { setSaving(false); alert(e.message); }
  };`
);
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
