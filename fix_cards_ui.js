const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Find the cards section handler and replace it with a working version
c = c.replace(
  `  if (section === "cards") return (
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
  );`,
  `  if (section === "cards") return (
    <div style={{ fontFamily: G.font }}>
      <button onClick={() => setSection(null)} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <i className="fas fa-arrow-left"></i> Back
      </button>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-credit-card" style={{ color: G.green, marginRight: 8 }}></i>Manage Cards</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>
          <i className="fas fa-info-circle" style={{ color: G.green, marginRight: 8 }}></i>
          Cards are added securely through Stripe when you make your first transfer. Your card details are never stored on our servers.
        </div>
      </Card>
      <Card style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "none", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <i className="fas fa-credit-card" style={{ color: "#fff", fontSize: 32 }}></i>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Visa / Mastercard / Amex</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>All major cards accepted</div>
          </div>
        </div>
      </Card>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
        <i className="fab fa-cc-visa" style={{ fontSize: 36, color: "#1a1f71" }}></i>
        <i className="fab fa-cc-mastercard" style={{ fontSize: 36, color: "#eb001b" }}></i>
        <i className="fab fa-cc-amex" style={{ fontSize: 36, color: "#007bc1" }}></i>
        <i className="fab fa-cc-discover" style={{ fontSize: 36, color: "#ff6600" }}></i>
      </div>
    </div>
  );`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
