const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Replace Legal card div with button
c = c.replace(
  `<Card style={{ marginBottom: 20, cursor: "pointer" }} onClick={() => setSection("legal")} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setSection("legal")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-balance-scale" style={{ color: G.green }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Legal Information</div>
            <div style={{ fontSize: 12, color: G.muted }}>Privacy Policy, Terms & Compliance</div>
          </div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
      </Card>`,
  `<button onClick={() => setSection("legal")} style={{ width: "100%", background: G.white, border: \`1px solid \${G.border}\`, borderRadius: 16, padding: 20, marginBottom: 20, cursor: "pointer", textAlign: "left", fontFamily: G.font }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="fas fa-balance-scale" style={{ color: G.green }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Legal Information</div>
            <div style={{ fontSize: 12, color: G.muted }}>Privacy Policy, Terms & Compliance</div>
          </div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
      </button>`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
