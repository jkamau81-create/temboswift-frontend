const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Replace legal section with inline content display
const oldLegal = `  if (section === "legal") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-balance-scale" style={{ color: G.green, marginRight: 8 }}></i>Legal Information</div>
      <Card>
        {[["Privacy Policy", "fa-lock", "https://temboswift.com/privacy.html"],
          ["Terms of Service", "fa-file-alt", "https://temboswift.com/terms.html"],
          ["Licenses & Compliance", "fa-landmark", "https://temboswift.com/privacy.html"]].map(([label, icon, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: \`1px solid \${G.border}\`, textDecoration: "none", color: G.text, WebkitTapHighlightColor: "transparent" }}>
            <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={\`fas \${icon}\`} style={{ color: G.green }}></i>
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
            <i className="fas fa-external-link-alt" style={{ color: G.muted, fontSize: 12 }}></i>
          </a>
        ))}
      </Card>
    </div>
  );`;

const newLegal = `  if (section === "legal") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-balance-scale" style={{ color: G.green, marginRight: 8 }}></i>Legal Information</div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}><strong>TemboSwift</strong> is a money transfer service that allows users in the United States to send money to Kenya.</p>
          <p style={{ marginBottom: 12 }}>We comply with all applicable US federal and state money transmission laws and regulations.</p>
          <p style={{ marginBottom: 12 }}>TemboSwift is registered with FinCEN as a Money Services Business (MSB).</p>
          <p>All transfers are processed securely using Stripe payment infrastructure with 256-bit encryption.</p>
        </div>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: G.green }}><i className="fas fa-lock"></i> Privacy Policy</div>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>We collect only the information needed to process your transfers and verify your identity. We never sell your data. Full policy at temboswift.com/privacy.html</div>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: G.green }}><i className="fas fa-file-alt"></i> Terms of Service</div>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>By using TemboSwift you agree to our terms. Transfers are subject to compliance checks. Full terms at temboswift.com/terms.html</div>
      </Card>
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: G.green }}><i className="fas fa-landmark"></i> Compliance</div>
        <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>TemboSwift operates in compliance with US AML/BSA regulations. We conduct KYC verification on all users and monitor transactions for suspicious activity.</div>
      </Card>
    </div>
  );`;

if (c.includes(oldLegal)) {
  c = c.replace(oldLegal, newLegal);
  console.log('Legal section replaced');
} else {
  console.log('Pattern not found - trying partial match');
  const idx = c.indexOf('if (section === "legal") return (');
  const idx2 = c.indexOf('if (section === "faqs") return (');
  if (idx !== -1 && idx2 !== -1) {
    c = c.substring(0, idx) + newLegal + '\n  ' + c.substring(idx2);
    console.log('Legal replaced by index');
  }
}

fs.writeFileSync('src/App.js', c, 'utf8');
