const fs = require('fs');
let c = fs.readFileSync('src/SendMoney.js', 'utf8');

// Remove the misplaced profile check
const bad = `{user && !user.date_of_birth && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b33", borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <i className="fas fa-exclamation-triangle" style={{ color: "#d97706", fontSize: 18, flexShrink: 0 }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Complete your profile</div>
            <div style={{ fontSize: 12, color: "#78350f" }}>Add date of birth and address before sending</div>
          </div>
          <button onClick={() => setPage && setPage("account")} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Complete \u2192</button>
        </div>
      )}
      `;

c = c.replace(bad, '');
fs.writeFileSync('src/SendMoney.js', c, 'utf8');
console.log('Done');
