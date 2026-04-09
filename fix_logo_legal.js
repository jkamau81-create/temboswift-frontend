const fs = require('fs');
let app = fs.readFileSync('src/App.js', 'utf8');

// 1. Fix header logo - show text logo as fallback and make image bigger
app = app.replace(
  `      <img src="/logo.png" alt="TemboSwift" style={{ height: 44, width: "auto", filter: "brightness(0) invert(1)", objectFit: "contain" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
        <div style={{ display: "none", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>Tembo<span style={{ color: "#4cde8f" }}>Swift</span></div>`,
  `      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="TemboSwift" style={{ height: 48, width: 48, objectFit: "contain" }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            Tembo<span style={{ color: "#4cde8f" }}>Swift</span>
          </div>
        </div>`
);

// 2. Fix legal section - use anchor tags properly
app = app.replace(
  `  if (section === "legal") return (
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
  );`,
  `  if (section === "legal") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-balance-scale" style={{ color: G.green, marginRight: 8 }}></i>Legal Information</div>
      <Card>
        <div onClick={() => window.open("https://temboswift.com/privacy.html", "_blank")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: \`1px solid \${G.border}\`, cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-lock" style={{ color: G.green }}></i></div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Privacy Policy</div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
        <div onClick={() => window.open("https://temboswift.com/terms.html", "_blank")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: \`1px solid \${G.border}\`, cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-file-alt" style={{ color: G.green }}></i></div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Terms of Service</div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
        <div onClick={() => window.open("https://temboswift.com/privacy.html", "_blank")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-landmark" style={{ color: G.green }}></i></div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Licenses & Compliance</div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
      </Card>
    </div>
  );`
);

fs.writeFileSync('src/App.js', app, 'utf8');
console.log('Done');
