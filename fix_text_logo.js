const fs = require('fs');
let app = fs.readFileSync('src/App.js', 'utf8');

// Replace auth screen logo img with text logo
app = app.replace(
  `<img src="/logo.png" alt="TemboSwift" style={{ height: 200, width: "auto", maxWidth: 300, margin: "0 auto 16px", display: "block", objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />`,
  `<div style={{ margin: "0 auto 16px", textAlign: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#ffffff" }}>Tembo</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#f5a623" }}>Swift</span>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4, letterSpacing: "0.15em", fontWeight: 600 }}>🐘 US → KENYA</div>
          </div>`
);

// Replace loading screen logo with text
app = app.replace(
  `<img src="/logo.png" alt="TemboSwift" style={{ height: 160, width: "auto", maxWidth: 280, marginBottom: 20, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />`,
  `<div style={{ marginBottom: 20, textAlign: "center" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: "#ffffff" }}>Tembo</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: "#f5a623" }}>Swift</span>
      </div>`
);

// Replace header logo with text logo
app = app.replace(
  `<img src="/logo.png" alt="TemboSwift" style={{ height: 56, width: "auto", maxWidth: 180, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
        <div style={{ display: "none", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>Tembo<span style={{ color: "#4cde8f" }}>Swift</span></div>`,
  `<div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#ffffff" }}>Tembo</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#f5a623" }}>Swift</span>
        </div>`
);

fs.writeFileSync('src/App.js', app, 'utf8');
console.log('Done');
