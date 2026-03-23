const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

// Replace single address field with structured address fields
const oldAddress = `const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", address: (user && user.address) || "", date_of_birth: (user && user.date_of_birth ? user.date_of_birth.substring(0,10) : "") });`;

const newAddress = `const parseAddress = (addr) => {
    if (!addr) return { street: "", city: "", state: "", zip: "", country: "United States" };
    const parts = addr.split(",").map(s => s.trim());
    return { street: parts[0] || "", city: parts[1] || "", state: parts[2] || "", zip: parts[3] || "", country: parts[4] || "United States" };
  };
  const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", date_of_birth: (user && user.date_of_birth ? user.date_of_birth.substring(0,10) : ""), ...parseAddress(user && user.address) });
  const buildAddress = (f) => [f.street, f.city, f.state, f.zip, f.country].filter(Boolean).join(", ");`;

content = content.replace(oldAddress, newAddress);

// Replace the address input with structured fields
const oldAddressInput = `["Address", "address", "text", "Your home address"], `;
const newAddressInput = ``;

// Replace the map that includes address with one that excludes it, then add structured fields after
const oldMap = `{[["Full Name", "full_name", "text", "Your legal name"], ["Address", "address", "text", "Your home address"], ["Date of Birth", "date_of_birth", "date", ""]].map(([label, key, type, placeholder]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input type={type} value={fields[key]} onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: "100%", background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}`;

const newMap = `{[["Full Name", "full_name", "text", "Your legal name"], ["Date of Birth", "date_of_birth", "date", ""]].map(([label, key, type, placeholder]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input type={type} value={fields[key]} onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: "100%", background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 10, marginTop: 4 }}>ADDRESS</div>
        {[["Street Address", "street", "123 Main St"], ["City", "city", "New York"], ["State", "state", "NY"], ["ZIP Code", "zip", "10001"], ["Country", "country", "United States"]].map(([label, key, placeholder]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 4 }}>{label.toUpperCase()}</div>
            <input value={fields[key] || ""} onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: "100%", background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}`;

content = content.replace(oldMap, newMap);

// Fix saveProfile to build address from parts
const oldSave = `await fetch("https://temboswift-backend.onrender.com/api/auth/me", { method: "PUT", headers: hdrs, body: JSON.stringify(fields) })`;
const newSave = `await fetch("https://temboswift-backend.onrender.com/api/auth/me", { method: "PUT", headers: hdrs, body: JSON.stringify({ ...fields, address: buildAddress(fields) }) })`;

content = content.replace(oldSave, newSave);

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
