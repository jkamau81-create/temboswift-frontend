const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Add phone field to auth form state
c = c.replace(
  'const [form, setForm] = useState({ email: "", password: "", full_name: "" });',
  'const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });\n  const [otpSent, setOtpSent] = useState(false);\n  const [otp, setOtp] = useState("");\n  const [registered, setRegistered] = useState(false);'
);

// Add phone input to register form
c = c.replace(
  '{mode === "register" && <Input label="Full Name" icon="fa-user" placeholder="Joseph Kamau" value={form.full_name} onChange={set("full_name")} />}',
  `{mode === "register" && <Input label="Full Name" icon="fa-user" placeholder="Joseph Kamau" value={form.full_name} onChange={set("full_name")} />}
          {mode === "register" && <Input label="Phone Number" icon="fa-mobile-alt" type="tel" placeholder="+1 214 304 5008" value={form.phone} onChange={set("phone")} />}`
);

// Update submit to handle OTP flow
c = c.replace(
  `const submit = async () => {
    setLoading(true); setError("");
    try {
      const data = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      localStorage.setItem("ts_token", data.token);
      onLogin(data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };`,
  `const submit = async () => {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const data = await api.login({ email: form.email, password: form.password });
        localStorage.setItem("ts_token", data.token);
        onLogin(data.user);
      } else if (!registered) {
        const data = await api.register(form);
        localStorage.setItem("ts_token", data.token);
        setRegistered(true);
        if (form.phone) {
          await api.sendOtp(form.phone);
          setOtpSent(true);
        } else {
          onLogin(data.user);
        }
      } else {
        await api.verifyOtp(otp);
        const me = await api.me();
        onLogin(me.user);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };`
);

// Add OTP input when otpSent
c = c.replace(
  `<Input label="Password" icon="fa-lock" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />`,
  `<Input label="Password" icon="fa-lock" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
          {otpSent && (
            <div>
              <div style={{ background: "#f0faf5", border: "1px solid #0b5e3533", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#0b5e35" }}>
                <i className="fas fa-sms"></i> Verification code sent to {form.phone}
              </div>
              <Input label="Verification Code" icon="fa-key" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
          )}`
);

// Update button text
c = c.replace(
  `mode === "login" ? <><i className="fas fa-sign-in-alt"></i> Sign In</> : <><i className="fas fa-user-plus"></i> Create Account</>`,
  `mode === "login" ? <><i className="fas fa-sign-in-alt"></i> Sign In</> : otpSent ? <><i className="fas fa-check"></i> Verify Phone</> : <><i className="fas fa-user-plus"></i> Create Account</>`
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
