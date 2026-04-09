import { useState, useEffect, useCallback } from "react";
import CardManager from "./CardManager";
import SendMoney from "./SendMoney";
import Receipt from "./Receipt";

const API = "https://temboswift-backend.onrender.com/api";

const G = {
  green: "#0b5e35", greenDark: "#093d28", greenLight: "#f0faf5",
  greenMid: "#1a7a4a", acc: "#f5a623",
  bg: "#f5f0e8", white: "#ffffff",
  border: "#e8e3d8",
  text: "#111111", muted: "#666666", light: "#999999",
  red: "#dc2626", redLight: "#fef2f2",
  font: "'DM Sans', sans-serif",
};

const api = {
  async req(path, opts = {}) {
    const token = localStorage.getItem("ts_token");
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  },
  login: (body) => api.req("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => api.req("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: () => api.req("/auth/me"),
  updateMe: (body) => api.req("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
  quote: (amount) => api.req(`/transfers/quote?amount=${amount}`),
  createTransfer: (body) => api.req("/transfers", { method: "POST", body: JSON.stringify(body) }),
  transfers: () => api.req("/transfers"),
  recipients: () => api.req("/recipients"),
  addRecipient: (body) => api.req("/recipients", { method: "POST", body: JSON.stringify(body) }),
  deleteRecipient: (id) => api.req(`/recipients/${id}`, { method: "DELETE" }),
  kycStart: () => api.req("/kyc/start", { method: "POST" }),
  kycStatus: () => api.req("/kyc/status"),
  sendOtp: (phone) => api.req("/auth/phone/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (otp) => api.req("/auth/phone/verify-otp", { method: "POST", body: JSON.stringify({ otp }) }),
  sendVerification: () => api.req("/auth/send-verification", { method: "POST" }),
  getCard: () => api.req("/cards"),
  setupCard: () => api.req("/cards/setup", { method: "POST" }),
  saveCard: (payment_method_id) => api.req("/cards/save", { method: "POST", body: JSON.stringify({ payment_method_id }) }),
  deleteCard: () => api.req("/cards", { method: "DELETE" }),
};

const statusConfig = {
  delivered: { color: G.green, bg: "#dcfce7", label: "Delivered", icon: "fa-check-circle" },
  pending: { color: "#92400e", bg: "#fef3c7", label: "Pending", icon: "fa-clock" },
  processing: { color: "#1d4ed8", bg: "#dbeafe", label: "Processing", icon: "fa-spinner" },
  funded: { color: "#1d4ed8", bg: "#dbeafe", label: "Funded", icon: "fa-dollar-sign" },
  failed: { color: G.red, bg: G.redLight, label: "Failed", icon: "fa-times-circle" },
};

const Avatar = ({ name, size = 40, bg = G.green }) => {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <i className={`fas ${cfg.icon}`} style={{ fontSize: 10 }}></i>
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "primary", disabled, full, small, style = {} }) => {
  const styles = {
    primary: { background: G.green, color: "#fff", border: "none" },
    outline: { background: "transparent", color: G.green, border: `1.5px solid ${G.green}` },
    ghost: { background: "transparent", color: G.muted, border: `1px solid ${G.border}` },
    danger: { background: G.red, color: "#fff", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding: small ? "8px 16px" : "12px 20px", borderRadius: 100, fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto", fontFamily: G.font, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.15s", ...style }}>
      {children}
    </button>
  );
};

const Input = ({ label, icon, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
    <div style={{ position: "relative" }}>
      {icon && <i className={`fas ${icon}`} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14 }}></i>}
      <input {...props} style={{ width: "100%", background: "#fff", border: `1.5px solid ${G.border}`, borderRadius: 10, padding: icon ? "12px 14px 12px 40px" : "12px 14px", fontSize: 15, color: G.text, outline: "none", fontFamily: G.font, transition: "border-color 0.2s", boxSizing: "border-box", ...props.style }}
        onFocus={e => e.target.style.borderColor = G.green}
        onBlur={e => e.target.style.borderColor = G.border}
      />
    </div>
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: G.white, borderRadius: 16, border: `1px solid ${G.border}`, padding: 20, ...style }}>
    {children}
  </div>
);

// ── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [registered, setRegistered] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
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
        await api.sendVerification().catch(() => {});
        if (form.phone) {
          await api.sendOtp(form.phone).catch(() => {});
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
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${G.greenDark} 0%, ${G.greenMid} 50%, ${G.greenDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: G.font }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="TemboSwift" style={{ height: 80, width: "auto", margin: "0 auto 16px", display: "block", filter: "brightness(0) invert(1)" }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            Tembo<span style={{ color: "#4cde8f" }}>Swift</span>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>US → Kenya · Zero Fees · Best Rates</div>
        </div>

        <Card style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", background: G.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setOtpSent(false); setRegistered(false); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: mode === m ? G.white : "transparent", color: mode === m ? G.text : G.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: G.font, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: G.redLight, border: `1px solid ${G.red}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: G.red, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {!otpSent ? (
            <>
              {mode === "register" && <Input label="Full Name" icon="fa-user" placeholder="Joseph Kamau" value={form.full_name} onChange={set("full_name")} />}
              {mode === "register" && <Input label="Phone Number" icon="fa-mobile-alt" type="tel" placeholder="+1 214 304 5008" value={form.phone} onChange={set("phone")} />}
              <Input label="Email Address" icon="fa-envelope" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              <Input label="Password" icon="fa-lock" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && submit()} />
            </>
          ) : (
            <div>
              <div style={{ background: G.greenLight, border: `1px solid ${G.green}33`, borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: G.green }}>
                <i className="fas fa-envelope"></i> Verification email sent to <strong>{form.email}</strong>
                {form.phone && <div style={{ marginTop: 4 }}><i className="fas fa-sms"></i> SMS code sent to {form.phone}</div>}
              </div>
              <Input label="Verification Code (if received by SMS)" icon="fa-key" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} />
              <div style={{ fontSize: 12, color: G.muted, marginBottom: 16 }}>Or click the link in your email to verify.</div>
            </div>
          )}

          <Btn onClick={submit} disabled={loading} full style={{ marginTop: 8 }}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Please wait...</>
              : mode === "login" ? <><i className="fas fa-sign-in-alt"></i> Sign In</>
              : otpSent ? <><i className="fas fa-check"></i> Verify & Continue</>
              : <><i className="fas fa-user-plus"></i> Create Account</>}
          </Btn>
        </Card>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          <i className="fas fa-shield-alt"></i> 256-bit encrypted · FinCEN registered · Your money is safe
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  const [transfers, setTransfers] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.transfers(), api.quote(200)])
      .then(([t, q]) => { setTransfers(t.transfers || []); setQuote(q); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSent = transfers.filter(t => t.status === "delivered").reduce((a, t) => a + parseFloat(t.amount_usd || 0), 0);
  const recent = transfers.slice(0, 3);

  return (
    <div style={{ fontFamily: G.font }}>
      <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMid})`, borderRadius: 20, padding: 24, marginBottom: 20, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}></div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>Welcome back 👋</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{user?.full_name?.split(" ")[0] || "there"}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>TOTAL SENT</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>${totalSent.toFixed(0)}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }}></div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>LIVE RATE</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#4cde8f" }}>
              1 USD = {quote ? parseFloat(quote.client_rate).toFixed(1) : "..."} KES
            </div>
          </div>
        </div>
      </div>

      {user?.kyc_status !== "approved" && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b33", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <i className="fas fa-exclamation-triangle" style={{ color: "#d97706", fontSize: 18, flexShrink: 0 }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Identity verification required</div>
            <div style={{ fontSize: 12, color: "#78350f" }}>Complete KYC to send money</div>
          </div>
          <button onClick={() => setPage("account")} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Verify →</button>
        </div>
      )}

      {!user?.date_of_birth && (
        <div style={{ background: G.blueLight || "#eff6ff", border: "1px solid #2563eb22", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <i className="fas fa-user-edit" style={{ color: "#2563eb", fontSize: 18, flexShrink: 0 }}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>Complete your profile</div>
            <div style={{ fontSize: 12, color: "#1e40af" }}>Add date of birth & address to send money</div>
          </div>
          <button onClick={() => setPage("account")} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Complete →</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setPage("send")} style={{ background: G.green, color: "#fff", border: "none", borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", fontFamily: G.font }}>
          <i className="fas fa-paper-plane" style={{ fontSize: 22, marginBottom: 8, display: "block" }}></i>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Send Money</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>US → Kenya</div>
        </button>
        <button onClick={() => setPage("recipients")} style={{ background: G.white, color: G.text, border: `1px solid ${G.border}`, borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", fontFamily: G.font }}>
          <i className="fas fa-users" style={{ fontSize: 22, color: G.green, marginBottom: 8, display: "block" }}></i>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Recipients</div>
          <div style={{ fontSize: 12, color: G.muted }}>Manage contacts</div>
        </button>
      </div>

      {quote && (
        <Card style={{ marginBottom: 20, background: G.greenLight, border: `1px solid ${G.green}22` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.green, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            <i className="fas fa-chart-line"></i> Live Exchange Rate
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: G.green }}>1 USD = {parseFloat(quote.client_rate).toFixed(2)} KES</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>No transfer fees · Best rate in market</div>
            </div>
            <Btn onClick={() => setPage("send")} small><i className="fas fa-arrow-right"></i> Send Now</Btn>
          </div>
        </Card>
      )}

      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span><i className="fas fa-history" style={{ color: G.green, marginRight: 8 }}></i>Recent Transfers</span>
        <button onClick={() => setPage("history")} style={{ background: "none", border: "none", color: G.green, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>See all</button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: G.muted }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }}></i></div>
      ) : recent.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 32, color: G.muted }}>
          <i className="fas fa-paper-plane" style={{ fontSize: 32, color: G.border, marginBottom: 12, display: "block" }}></i>
          No transfers yet. Send your first transfer!
        </Card>
      ) : recent.map(tx => (
        <Card key={tx.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, background: G.greenLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="fas fa-paper-plane" style={{ color: G.green, fontSize: 18 }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{tx.recipient_name || "Recipient"}</div>
            <div style={{ fontSize: 12, color: G.muted }}>{new Date(tx.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>-${parseFloat(tx.amount_usd).toFixed(0)}</div>
            <StatusBadge status={tx.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── RECIPIENTS ────────────────────────────────────────────────────────────────
function Recipients() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", delivery_method: "mpesa" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const load = useCallback(() => {
    api.recipients().then(d => setList(d.recipients || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const add = async () => {
    setSaving(true); setError("");
    try { await api.addRecipient(form); setShowAdd(false); setForm({ full_name: "", phone: "", delivery_method: "mpesa" }); load(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Remove this recipient?")) return;
    await api.deleteRecipient(id).catch(() => {}); load();
  };

  const bgColors = [G.green, "#2563eb", "#7c3aed", "#c27c3a", "#dc2626"];

  return (
    <div style={{ fontFamily: G.font }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}><i className="fas fa-users" style={{ color: G.green, marginRight: 8 }}></i>Recipients</div>
        <Btn onClick={() => setShowAdd(!showAdd)} small>
          <i className={`fas fa-${showAdd ? "times" : "plus"}`}></i> {showAdd ? "Cancel" : "Add New"}
        </Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, border: `2px solid ${G.green}33` }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: G.green }}><i className="fas fa-user-plus"></i> New Recipient</div>
          {error && <div style={{ background: G.redLight, color: G.red, padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Input label="Full Name" icon="fa-user" placeholder="Grace Wanjiku" value={form.full_name} onChange={set("full_name")} />
          <Input label="M-Pesa Phone" icon="fa-mobile-alt" placeholder="+254712345678" value={form.phone} onChange={set("phone")} />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase" }}>Delivery Method</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["mpesa", "bank"].map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, delivery_method: m }))}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${form.delivery_method === m ? G.green : G.border}`, background: form.delivery_method === m ? G.greenLight : "transparent", color: form.delivery_method === m ? G.green : G.muted, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: G.font }}>
                  <i className={`fas fa-${m === "mpesa" ? "mobile-alt" : "university"}`} style={{ marginRight: 6 }}></i>
                  {m === "mpesa" ? "M-Pesa" : "Bank"}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={add} disabled={saving} full>
            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Recipient</>}
          </Btn>
        </Card>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: G.muted }}></i></div>
      ) : list.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <i className="fas fa-users" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
          <div style={{ color: G.muted }}>No recipients yet</div>
          <div style={{ fontSize: 13, color: G.light, marginTop: 4 }}>Add someone to get started</div>
        </Card>
      ) : list.map((r, i) => (
        <Card key={r.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={r.full_name} bg={bgColors[i % bgColors.length]} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{r.full_name}</div>
            <div style={{ fontSize: 13, color: G.muted }}><i className="fas fa-mobile-alt" style={{ marginRight: 4 }}></i>{r.phone}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: G.green, background: G.greenLight, padding: "2px 8px", borderRadius: 100, marginTop: 4, display: "inline-block" }}>
              <i className="fas fa-wallet" style={{ marginRight: 4 }}></i>{r.delivery_method || "M-Pesa"}
            </span>
          </div>
          <button onClick={() => del(r.id)} style={{ background: G.redLight, border: "none", color: G.red, width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-trash-alt" style={{ fontSize: 13 }}></i>
          </button>
        </Card>
      ))}
    </div>
  );
}

// ── HISTORY ──────────────────────────────────────────────────────────────────
function History() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.transfers().then(d => setTransfers(d.transfers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const shown = filter === "all" ? transfers : transfers.filter(t => t.status === filter);
  const totalDelivered = transfers.filter(t => t.status === "delivered").reduce((a, t) => a + parseFloat(t.amount_usd || 0), 0);

  return (
    <div style={{ fontFamily: G.font }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}><i className="fas fa-history" style={{ color: G.green, marginRight: 8 }}></i>Transfer History</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Card style={{ background: G.greenLight, border: `1px solid ${G.green}22` }}>
          <div style={{ fontSize: 11, color: G.green, fontWeight: 600, marginBottom: 4 }}>TOTAL SENT</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: G.green }}>${totalDelivered.toFixed(0)}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: G.muted, fontWeight: 600, marginBottom: 4 }}>TRANSFERS</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{transfers.length}</div>
        </Card>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {["all", "delivered", "pending", "failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${filter === f ? G.green : G.border}`, background: filter === f ? G.greenLight : "transparent", color: filter === f ? G.green : G.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: G.font }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: G.muted }}></i></div>
      ) : shown.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <i className="fas fa-inbox" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
          <div style={{ color: G.muted }}>No transfers found</div>
        </Card>
      ) : shown.map(tx => (
        <Card key={tx.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: tx.status === "delivered" ? G.greenLight : tx.status === "failed" ? G.redLight : "#fef3c7", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`fas ${statusConfig[tx.status]?.icon || "fa-clock"}`} style={{ color: statusConfig[tx.status]?.color || G.muted, fontSize: 18 }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{tx.recipient_name || "Recipient"}</div>
              <div style={{ fontSize: 12, color: G.muted }}>{new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              <div style={{ fontSize: 12, color: G.green, fontWeight: 600, marginTop: 2 }}>KES {parseFloat(tx.amount_kes || 0).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>-${parseFloat(tx.amount_usd || 0).toFixed(0)}</div>
              <StatusBadge status={tx.status} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── KYC BUTTON ────────────────────────────────────────────────────────────────
function KycVerifyButton({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startKyc = async () => {
    setLoading(true); setError("");
    try {
      const d = await api.kycStart();
      if (d.status === "approved") { alert("Your identity is already verified!"); setLoading(false); return; }
      if (d.url) window.location.href = d.url;
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {error && <div style={{ color: G.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <Btn onClick={startKyc} disabled={loading} full>
        {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-id-card"></i> Start Verification</>}
      </Btn>
    </div>
  );
}

// ── ACCOUNT ──────────────────────────────────────────────────────────────────
function Account({ user, logout, onNavigate }) {
  const [section, setSection] = useState(null);
  const [fields, setFields] = useState({ full_name: user?.full_name || "", address: user?.address || "", date_of_birth: user?.date_of_birth?.substring?.(0, 10) || "" });
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.updateMe(fields);
      setMsg("✅ Profile saved!"); setTimeout(() => { setMsg(""); window.location.reload(); }, 1500);
    } catch (e) { setMsg("❌ Failed to save"); }
    finally { setSaving(false); }
  };

  const sendOtp = async () => {
    setSaving(true);
    try { await api.sendOtp(phone); setOtpSent(true); setMsg("Code sent to " + phone); }
    catch (e) { setMsg("Failed to send code"); }
    finally { setSaving(false); }
  };

  const verifyOtp = async () => {
    setSaving(true);
    try { await api.verifyOtp(otp); setMsg("✅ Phone verified!"); setTimeout(() => window.location.reload(), 1500); }
    catch (e) { setMsg("Invalid code"); }
    finally { setSaving(false); }
  };

  const faqs = [
    { q: "How long does a transfer take?", a: "Most M-Pesa transfers arrive in under 2 minutes." },
    { q: "What are your fees?", a: "Zero fees. We earn a small spread on the exchange rate." },
    { q: "What is the exchange rate?", a: "Live mid-market rate with 0.8% spread — best in market." },
    { q: "What is the maximum transfer?", a: "Maximum single transfer is $10,000." },
    { q: "Is my money safe?", a: "Yes. 256-bit encryption and Stripe payments protect every transfer." },
    { q: "How do I verify my identity?", a: "Go to Account → KYC Verification and follow the steps. You'll need a government ID." },
  ];

  const menuItems = [
    { icon: "fa-user", label: "Personal Details", sub: "Name, address, date of birth", section: "personal" },
    { icon: "fa-chart-bar", label: "Transfer Limits", sub: user?.kyc_status === "approved" ? "$10,000 per transfer" : "Verify ID to unlock", section: "limits" },
    { icon: "fa-credit-card", label: "Manage Cards", sub: "Add or remove payment cards", section: "cards" },
    { icon: "fa-id-card", label: "KYC Verification", sub: user?.kyc_status === "approved" ? "✅ Verified" : "⚠️ Action required", section: "kyc" },
  ];

  const supportItems = [
    { icon: "fa-comment-dots", label: "Live Chat", sub: "Available 24/7", action: () => window.$crisp && window.$crisp.push(["do", "chat:open"]) },
    { icon: "fa-question-circle", label: "FAQs", sub: "Common questions answered", action: () => setSection("faqs") },
    { icon: "fa-envelope", label: "Email Support", sub: "support@temboswift.com", action: () => window.open("mailto:support@temboswift.com") },
  ];

  const BackBtn = () => (
    <button onClick={() => setSection(null)} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
      <i className="fas fa-arrow-left"></i> Back
    </button>
  );

  if (section === "personal") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-user" style={{ color: G.green, marginRight: 8 }}></i>Personal Details</div>
      {msg && <div style={{ background: msg.includes("✅") ? G.greenLight : G.redLight, color: msg.includes("✅") ? G.green : G.red, padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{msg}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.green, marginBottom: 16 }}>BASIC INFO</div>
        <Input label="Full Name" icon="fa-user" value={fields.full_name} onChange={e => setFields(f => ({ ...f, full_name: e.target.value }))} placeholder="Your legal name" />
        <Input label="Address" icon="fa-map-marker-alt" value={fields.address} onChange={e => setFields(f => ({ ...f, address: e.target.value }))} placeholder="Street, City, State, ZIP, Country" />
        <Input label="Date of Birth" icon="fa-calendar" type="date" value={fields.date_of_birth} onChange={e => setFields(f => ({ ...f, date_of_birth: e.target.value }))} />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase" }}>Email Address</div>
          <div style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "12px 14px", color: G.muted, fontSize: 15 }}>
            <i className="fas fa-envelope" style={{ marginRight: 8 }}></i>{user?.email}
          </div>
        </div>
        <Btn onClick={saveProfile} disabled={saving} full>
          {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
        </Btn>
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.green, marginBottom: 16 }}>
          PHONE {user?.phone_verified ? <span style={{ color: G.green }}>✅ Verified</span> : <span style={{ color: "#d97706" }}>⚠️ Not verified</span>}
        </div>
        <Input icon="fa-mobile-alt" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+12143045008" />
        {!otpSent ? (
          <Btn variant="outline" onClick={sendOtp} disabled={saving} full>
            <i className="fas fa-sms"></i> Send Verification Code
          </Btn>
        ) : (
          <>
            <Input icon="fa-key" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" />
            <Btn onClick={verifyOtp} disabled={saving} full>
              <i className="fas fa-check"></i> Verify Code
            </Btn>
          </>
        )}
      </Card>
    </div>
  );

  if (section === "cards") return (<CardManager onBack={() => setSection(null)} />);

  if (section === "limits") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-chart-bar" style={{ color: G.green, marginRight: 8 }}></i>Transfer Limits</div>
      <Card>
        {[["Single transfer", user?.kyc_status === "approved" ? "$10,000" : "$0 (KYC required)"],
          ["Daily limit", user?.kyc_status === "approved" ? "$10,000" : "Pending KYC"],
          ["Monthly limit", user?.kyc_status === "approved" ? "$50,000" : "Pending KYC"],
          ["Minimum transfer", "$1"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${G.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fas fa-arrow-right" style={{ color: G.green, fontSize: 12 }}></i>
              <span style={{ fontSize: 14, color: G.muted }}>{k}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: G.green }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );

  if (section === "kyc") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-id-card" style={{ color: G.green, marginRight: 8 }}></i>Identity Verification</div>
      <Card style={{ textAlign: "center", padding: 32 }}>
        <i className="fas fa-shield-alt" style={{ fontSize: 48, color: G.green, marginBottom: 16, display: "block" }}></i>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {user?.kyc_status === "approved" ? "Identity Verified ✅" : "Verify Your Identity"}
        </div>
        <div style={{ fontSize: 14, color: G.muted, marginBottom: 20, lineHeight: 1.6 }}>
          {user?.kyc_status === "approved" ? "Your identity has been verified. You can send up to $10,000 per transfer." : "Required by US law to send money. Takes 2 minutes with a government ID or passport."}
        </div>
        {user?.kyc_status !== "approved" && (
          <div style={{ background: G.bg, borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "left" }}>
            {[["📋", "Prepare your ID", "Passport, driver license or national ID"],
              ["🤳", "Take a selfie", "A quick photo to match your ID"],
              ["✅", "Get verified", "Usually instant — sometimes up to 24 hours"]].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 12, color: G.muted }}>{desc}</div></div>
              </div>
            ))}
          </div>
        )}
        {user?.kyc_status !== "approved" && <KycVerifyButton user={user} />}
      </Card>
    </div>
  );

  if (section === "legal") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-balance-scale" style={{ color: G.green, marginRight: 8 }}></i>Legal Information</div>
      <Card>
        {[["Privacy Policy", "fa-lock", "https://temboswift.com/privacy.html"],
          ["Terms of Service", "fa-file-alt", "https://temboswift.com/terms.html"],
          ["Licenses & Compliance", "fa-landmark", "https://temboswift.com/privacy.html"]].map(([label, icon, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${G.border}`, textDecoration: "none", color: G.text }}>
            <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`fas ${icon}`} style={{ color: G.green }}></i>
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
            <i className="fas fa-external-link-alt" style={{ color: G.muted, fontSize: 12 }}></i>
          </a>
        ))}
      </Card>
    </div>
  );

  if (section === "faqs") return (
    <div style={{ fontFamily: G.font }}>
      <BackBtn />
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-question-circle" style={{ color: G.green, marginRight: 8 }}></i>FAQs</div>
      <Card>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${G.border}` : "none" }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", cursor: "pointer" }}>
              <div style={{ fontSize: 14, fontWeight: 600, flex: 1, paddingRight: 12 }}>{faq.q}</div>
              <i className={`fas fa-${openFaq === i ? "minus" : "plus"}`} style={{ color: G.green, fontSize: 14 }}></i>
            </div>
            {openFaq === i && <div style={{ fontSize: 13, color: G.muted, paddingBottom: 14, lineHeight: 1.7 }}>{faq.a}</div>}
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div style={{ fontFamily: G.font }}>
      <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMid})`, borderRadius: 20, padding: 24, marginBottom: 20, color: "#fff", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: "2px solid rgba(255,255,255,0.3)" }}>
          <span style={{ fontSize: 24, fontWeight: 800 }}>{(user?.full_name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.full_name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{user?.email}</div>
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: user?.kyc_status === "approved" ? "rgba(76,222,143,0.2)" : "rgba(245,158,11,0.2)", borderRadius: 100, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
          <i className={`fas fa-${user?.kyc_status === "approved" ? "check-circle" : "exclamation-triangle"}`}></i>
          {user?.kyc_status === "approved" ? "Identity Verified" : "KYC Pending"}
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Account</div>
      <Card style={{ marginBottom: 16 }}>
        {menuItems.map((item, i) => (
          <div key={item.label} onClick={() => setSection(item.section)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < menuItems.length - 1 ? `1px solid ${G.border}` : "none", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`fas ${item.icon}`} style={{ color: G.green }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{item.sub}</div>
            </div>
            <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Support</div>
      <Card style={{ marginBottom: 16 }}>
        {supportItems.map((item, i) => (
          <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < supportItems.length - 1 ? `1px solid ${G.border}` : "none", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`fas ${item.icon}`} style={{ color: G.green }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{item.sub}</div>
            </div>
            <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Legal</div>
      <Card style={{ marginBottom: 20, cursor: "pointer" }} onClick={() => setSection("legal")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: G.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-balance-scale" style={{ color: G.green }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Legal Information</div>
            <div style={{ fontSize: 12, color: G.muted }}>Privacy Policy, Terms & Compliance</div>
          </div>
          <i className="fas fa-chevron-right" style={{ color: G.muted, fontSize: 12 }}></i>
        </div>
      </Card>

      <div style={{ textAlign: "center", fontSize: 12, color: G.muted, marginBottom: 16 }}>TemboSwift v1.0.0 · US → Kenya · Zero Fees</div>

      <button onClick={logout} style={{ width: "100%", background: G.redLight, border: `1px solid ${G.red}33`, borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, color: G.red, cursor: "pointer", fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 40 }}>
        <i className="fas fa-sign-out-alt"></i> Sign Out
      </button>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "fa-home", label: "Home" },
  { id: "send", icon: "fa-paper-plane", label: "Send" },
  { id: "recipients", icon: "fa-users", label: "Recipients" },
  { id: "history", icon: "fa-history", label: "History" },
  { id: "account", icon: "fa-user-circle", label: "Account" },
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ts_token");
    if (token) {
      api.me().then(d => setUser(d.user)).catch(() => localStorage.removeItem("ts_token")).finally(() => setChecking(false));
    } else { setChecking(false); }
  }, []);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${G.greenDark}, ${G.greenMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: G.font }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <img src="/logo.png" alt="TemboSwift" style={{ height: 80, filter: "brightness(0) invert(1)", marginBottom: 20 }} onError={e => e.target.style.display = "none"} />
        <div><i className="fas fa-spinner fa-spin" style={{ fontSize: 20 }}></i></div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={u => { setUser(u); setPage("dashboard"); }} />;

  const logout = () => { localStorage.removeItem("ts_token"); setUser(null); };

  const pages = {
    dashboard: <Dashboard user={user} setPage={setPage} />,
    send: <SendMoney user={user} setPage={setPage} onDone={() => setPage("dashboard")} />,
    recipients: <Recipients />,
    history: <History />,
    account: <Account user={user} logout={logout} onNavigate={setPage} />,
  };

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ background: G.green, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <img src="/logo.png" alt="TemboSwift" style={{ height: 36, filter: "brightness(0) invert(1)" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
        <div style={{ display: "none", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>Tembo<span style={{ color: "#4cde8f" }}>Swift</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 100, fontWeight: 600 }}>
            <i className="fas fa-bolt" style={{ color: "#4cde8f", marginRight: 4 }}></i>LIVE
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 100px" }}>
        {pages[page]}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: `1px solid ${G.border}`, display: "flex", zIndex: 50, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ flex: 1, padding: "10px 0 8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: G.font }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: page === n.id ? G.greenLight : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
              <i className={`fas ${n.icon}`} style={{ fontSize: 16, color: page === n.id ? G.green : G.muted }}></i>
            </div>
            <span style={{ fontSize: 10, fontWeight: page === n.id ? 700 : 500, color: page === n.id ? G.green : G.muted }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}




