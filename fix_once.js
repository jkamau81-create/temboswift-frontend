const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Fix Manage Cards section to navigate to section
c = c.replace('{ icon: "fa-credit-card", label: "Manage Cards", sub: "Added when you transfer", section: null }', '{ icon: "fa-credit-card", label: "Manage Cards", sub: "Add or remove payment cards", section: "cards" }');

// Add cards section handler
c = c.replace('  if (section === "legal") return (', `  if (section === "cards") return (
    <div style={{ fontFamily: G.font }}>
      <button onClick={() => setSection(null)} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <i className="fas fa-arrow-left"></i> Back
      </button>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-credit-card" style={{ color: G.green, marginRight: 8 }}></i>Manage Cards</div>
      <Card style={{ textAlign: "center", padding: 32, marginBottom: 16 }}>
        <i className="fas fa-credit-card" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
        <div style={{ color: G.muted, marginBottom: 4 }}>Card management</div>
        <div style={{ fontSize: 13, color: G.light, marginBottom: 20 }}>Cards are added securely via Stripe when you make your first transfer</div>
      </Card>
    </div>
  );
  if (section === "legal") return (`);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
