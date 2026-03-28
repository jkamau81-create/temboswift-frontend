const fs = require('fs');

// ── FIX App.js ──────────────────────────────────────────────────────────────
let app = fs.readFileSync('src/App.js', 'utf8');

// 1. Fix Legal - use <a> tags instead of onClick with window.open
app = app.replace(
  `{[["Privacy Policy", "fa-lock", "https://temboswift.com/privacy.html"],
          ["Terms of Service", "fa-file-alt", "https://temboswift.com/terms.html"],
          ["Licenses & Compliance", "fa-landmark", "https://temboswift.com/privacy.html"]].map(([label, icon, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: \`1px solid \${G.border}\`, textDecoration: "none", color: G.text }}>`,
  `{[["Privacy Policy", "fa-lock", "https://temboswift.com/privacy.html"],
          ["Terms of Service", "fa-file-alt", "https://temboswift.com/terms.html"],
          ["Licenses & Compliance", "fa-landmark", "https://temboswift.com/privacy.html"]].map(([label, icon, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: \`1px solid \${G.border}\`, textDecoration: "none", color: G.text, WebkitTapHighlightColor: "transparent" }}>`
);

// 2. Fix minimum transfer amount - change $1 to $5
app = app.replace('"Minimum transfer", "$1"', '"Minimum transfer", "$5"');

// 3. Fix logo size in header - make it bigger
app = app.replace(
  'style={{ height: 36, filter: "brightness(0) invert(1)" }}',
  'style={{ height: 44, width: "auto", filter: "brightness(0) invert(1)", objectFit: "contain" }}'
);

// 4. Fix logo size in loading screen
app = app.replace(
  'style={{ height: 80, filter: "brightness(0) invert(1)", marginBottom: 20 }}',
  'style={{ height: 100, width: "auto", filter: "brightness(0) invert(1)", marginBottom: 20, objectFit: "contain" }}'
);

// 5. Fix logo in auth screen
app = app.replace(
  'style={{ height: 80, width: "auto", margin: "0 auto 16px", display: "block", filter: "brightness(0) invert(1)" }}',
  'style={{ height: 100, width: "auto", margin: "0 auto 16px", display: "block", filter: "brightness(0) invert(1)", objectFit: "contain" }}'
);

// 6. Move Crisp chat button up so it doesn't block Account tab
app = app.replace(
  'padding: "20px 16px 100px"',
  'padding: "20px 16px 120px"'
);

fs.writeFileSync('src/App.js', app, 'utf8');
console.log('App.js fixed');

// ── FIX Recipients - delete button ─────────────────────────────────────────
let recip = app;
// Check if delete works - it should be fine in App.js already
console.log('Delete recipient check:', app.includes('deleteRecipient') ? 'OK' : 'MISSING');

// ── FIX SendMoney - add M-Pesa/Bank delivery option ────────────────────────
let send = fs.readFileSync('src/SendMoney.js', 'utf8');

// Add delivery method selection in step 2
send = send.replace(
  `  const [nameError, setNameError] = useState("");`,
  `  const [nameError, setNameError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("mpesa");`
);

// Add delivery method selector after phone input section
send = send.replace(
  `          {nameError && <div style={{ fontSize: 13, color: G.red, marginBottom: 12 }}><i className="fas fa-exclamation-circle"></i> {nameError}</div>}`,
  `          {/* Delivery method */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Delivery Method</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[{id:"mpesa",icon:"fa-mobile-alt",label:"M-Pesa"},{id:"bank",icon:"fa-university",label:"Bank"}].map(m => (
                <button key={m.id} onClick={() => setDeliveryMethod(m.id)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: \`2px solid \${deliveryMethod === m.id ? G.green : G.border}\`, background: deliveryMethod === m.id ? G.greenLight : "#fff", color: deliveryMethod === m.id ? G.green : G.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <i className={\`fas \${m.icon}\`}></i> {m.label}
                </button>
              ))}
            </div>
          </div>
          {nameError && <div style={{ fontSize: 13, color: G.red, marginBottom: 12 }}><i className="fas fa-exclamation-circle"></i> {nameError}</div>}`
);

// Pass delivery method to recipient save
send = send.replace(
  `const r = await req("/recipients", { method: "POST", body: JSON.stringify({ full_name: mpesaName?.name || "Recipient", phone: fullPhone, delivery_method: "mpesa" }) });`,
  `const r = await req("/recipients", { method: "POST", body: JSON.stringify({ full_name: mpesaName?.name || "Recipient", phone: fullPhone, delivery_method: deliveryMethod }) });`
);

// Add delivery method to confirm screen
send = send.replace(
  `["Delivery", "~2 min via M-Pesa"],`,
  `["Delivery method", deliveryMethod === "mpesa" ? "📱 M-Pesa" : "🏦 Bank Transfer"],
                ["Estimated time", "~2 minutes"],`
);

fs.writeFileSync('src/SendMoney.js', send, 'utf8');
console.log('SendMoney.js fixed');

console.log('\n✅ All fixes applied successfully!');
