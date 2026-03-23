const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

const newPersonal = `  if (activeSection === "personal") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>back</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Personal Details</div>
      </div>
      {profileMsg && <div style={{ background: G.greenG, border: "1px solid " + G.green, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: G.green, marginBottom: 16 }}>{profileMsg}</div>}
      <div style={{ ...css.card, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em", marginBottom: 16 }}>BASIC INFO</div>
        {[["Full Name", "full_name", "text", "Your legal name"], ["Address", "address", "text", "Your home address"], ["Date of Birth", "date_of_birth", "date", ""]].map(([label, key, type, placeholder]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input type={type} value={fields[key]} onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: "100%", background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 6 }}>EMAIL ADDRESS</div>
          <div style={{ background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.muted, fontSize: 14 }}>{user && user.email}</div>
        </div>
        <button onClick={saveProfile} disabled={profileSaving} style={{ width: "100%", background: G.green, color: "#000", border: "none", borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{profileSaving ? "Saving..." : "Save Changes"}</button>
      </div>
      <div style={css.card}>
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em", marginBottom: 16 }}>MOBILE NUMBER {user && user.phone_verified ? "Verified" : "Not verified"}</div>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+12143045008" style={{ width: "100%", background: G.surface, border: "1px solid " + G.border, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        {!otpSent ? (
          <button onClick={sendOtp} disabled={profileSaving} style={{ width: "100%", background: G.surface, border: "1px solid " + G.green, color: G.green, borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{profileSaving ? "Sending..." : "Send Verification Code"}</button>
        ) : (
          <div>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" style={{ width: "100%", background: G.surface, border: "1px solid " + G.green, borderRadius: 8, padding: "10px 14px", color: G.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
            <button onClick={verifyOtp} disabled={profileSaving} style={{ width: "100%", background: G.green, color: "#000", border: "none", borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{profileSaving ? "Verifying..." : "Verify Code"}</button>
          </div>
        )}
      </div>
    </div>
  );`;

// Find and replace the personal section
const start = content.indexOf('  if (activeSection === "personal")');
const end = content.indexOf('  if (activeSection === "limits")');

if (start === -1 || end === -1) {
  console.log('Could not find personal section. start=' + start + ' end=' + end);
  process.exit(1);
}

content = content.substring(0, start) + newPersonal + '\n  ' + content.substring(end);
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
