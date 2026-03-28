const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

c = c.replace(
  `      <div style={{ fontSize: 14, color: G.muted, marginBottom: 24, lineHeight: 1.6 }}>
          {user?.kyc_status === "approved" ? "Your identity has been verified. You can send up to $10,000 per transfer." : "Required to send money. Takes about 2 minutes with a government ID."}
        </div>`,
  `      <div style={{ fontSize: 14, color: G.muted, marginBottom: 20, lineHeight: 1.6 }}>
          {user?.kyc_status === "approved" ? "Your identity has been verified. You can send up to $10,000 per transfer." : "Required by US law to send money. Takes 2 minutes with a government ID or passport."}
        </div>
        {user?.kyc_status !== "approved" && (
          <div style={{ background: G.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            {[["📋", "Prepare your ID", "Passport, driver license or national ID"],["🤳", "Take a selfie", "A quick photo to match your ID"],["✅", "Get verified", "Usually instant — sometimes up to 24 hours"]].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 12, color: G.muted }}>{desc}</div></div>
              </div>
            ))}
          </div>
        )}`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
