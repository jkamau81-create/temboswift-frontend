const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Fix header - replace img tag with text logo
c = c.replace(
  `<img src="/logo.png" alt="TemboSwift" style={{ height: 56, width: "auto", maxWidth: 180, objectFit: "contain" }}
            onError={e => e.target.style.display = "none"} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            Tembo<span style={{ color: "#4cde8f" }}>Swift</span>
          </div>`,
  `<span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "#fff" }}>Tembo</span><span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "#f5a623" }}>Swift</span>`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
