import re
with open('src/App.js', encoding='utf-8') as f:
    content = f.read()

old = 'function Support({ user, onLogout, onNavigate }) {'
new = '''function Support({ user, onLogout, onNavigate }) {
  const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", address: (user && user.address) || "", date_of_birth: (user && user.date_of_birth) || "" });
  const [phone, setPhone] = useState((user && user.phone) || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const tok = localStorage.getItem("ks_token");
  const hdrs = { "Content-Type": "application/json", Authorization: "Bearer " + tok };
  const saveProfile = async () => { setProfileSaving(true); try { await fetch("https://temboswift-backend.onrender.com/api/auth/me", { method: "PUT", headers: hdrs, body: JSON.stringify(fields) }); setProfileMsg("Profile saved!"); setProfileSaving(false); setTimeout(() => { setProfileMsg(""); window.location.reload(); }, 1500); } catch(e) { setProfileSaving(false); } };
  const sendOtp = async () => { setProfileSaving(true); try { await fetch("https://temboswift-backend.onrender.com/api/auth/phone/send-otp", { method: "POST", headers: hdrs, body: JSON.stringify({ phone }) }); setOtpSent(true); setProfileMsg("Code sent!"); setProfileSaving(false); } catch(e) { setProfileSaving(false); } };
  const verifyOtp = async () => { setProfileSaving(true); try { const res = await fetch("https://temboswift-backend.onrender.com/api/auth/phone/verify-otp", { method: "POST", headers: hdrs, body: JSON.stringify({ otp }) }); const data = await res.json(); if (data.message) { setProfileMsg("Phone verified!"); setTimeout(() => window.location.reload(), 1500); } else { setProfileMsg("Invalid code"); } setProfileSaving(false); } catch(e) { setProfileSaving(false); } };'''

result = content.replace(old, new, 1)
with open('src/App.js', 'w', encoding='utf-8') as f:
    f.write(result)
print('Done')
