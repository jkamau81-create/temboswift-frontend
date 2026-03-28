const fs = require('fs');
let c = fs.readFileSync('src/App.js', 'utf8');

// Add sendVerification API method
c = c.replace(
  "  sendOtp: (phone) => api.req(\"/auth/phone/send-otp\", { method: \"POST\", body: JSON.stringify({ phone }) }),",
  `  sendOtp: (phone) => api.req("/auth/phone/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  sendVerification: () => api.req("/auth/send-verification", { method: "POST" }),`
);

// Update register flow to send verification email
c = c.replace(
  `const data = await api.register(form);
        localStorage.setItem("ts_token", data.token);
        setRegistered(true);
        if (form.phone) {
          await api.sendOtp(form.phone);
          setOtpSent(true);
        } else {
          onLogin(data.user);
        }`,
  `const data = await api.register(form);
        localStorage.setItem("ts_token", data.token);
        setRegistered(true);
        await api.sendVerification().catch(() => {});
        if (form.phone) {
          await api.sendOtp(form.phone).catch(() => {});
          setOtpSent(true);
        } else {
          setOtpSent(true);
        }`
);

// Update OTP sent message to mention email too
c = c.replace(
  '<i className="fas fa-sms"></i> Verification code sent to {form.phone}',
  '<i className="fas fa-envelope"></i> Verification email sent to {form.email}. {form.phone && "SMS code sent to " + form.phone}'
);

fs.writeFileSync('src/App.js', c, 'utf8');
console.log('Done');
