import AdminDashboard from './Admin';
import { useState, useEffect, useCallback } from "react";

// ─── API LAYER ────────────────────────────────────────────────────────────────
const API_BASE = "https://temboswift-backend.onrender.com/api";

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("ks_token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

const api = {
  register: (body) => apiCall("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login:    (body) => apiCall("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  me:       ()     => apiCall("/auth/me"),
  quote:    (amt)  => apiCall(`/transfers/quote?amount=${amt}`),
  transfers:()     => apiCall("/transfers"),
  createTransfer: (body) => apiCall("/transfers", { method: "POST", body: JSON.stringify(body) }),
  recipients: ()   => apiCall("/recipients"),
  addRecipient: (body) => apiCall("/recipients", { method: "POST", body: JSON.stringify(body) }),
  deleteRecipient: (id) => apiCall(`/recipients/${id}`, { method: "DELETE" }),
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg: "#07090c", surface: "#0c1017", card: "#111820",
  border: "#1c2a35", borderB: "#253545",
  green: "#00e676", greenD: "#00b85a", greenG: "rgba(0,230,118,0.12)",
  blue: "#38bdf8", orange: "#fb923c", red: "#f87171", yellow: "#fbbf24",
  text: "#e2edf5", muted: "#4a6375",
  font: "'DM Sans', sans-serif", mono: "'JetBrains Mono', monospace",
};

const css = {
  app: { minHeight: "100vh", background: G.bg, color: G.text, fontFamily: G.font, display: "flex", flexDirection: "column" },
  shell: { display: "flex", flex: 1, minHeight: 0 },
  sidebar: { width: 220, background: G.surface, borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column", padding: "0 0 24px", flexShrink: 0 },
  main: { flex: 1, overflowY: "auto", padding: "32px 40px" },
  navItem: (a) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, color: a ? G.green : G.muted, background: a ? "rgba(0,230,118,0.07)" : "transparent", borderLeft: a ? `2px solid ${G.green}` : "2px solid transparent", transition: "all 0.15s", userSelect: "none" }),
  topbar: { background: G.surface, borderBottom: `1px solid ${G.border}`, padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  card: { background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 24 },
  btnPrimary: { background: G.green, color: "#000", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.font, transition: "opacity 0.15s", width: "100%" },
  btnSecondary: { background: "transparent", color: G.text, border: `1px solid ${G.border}`, borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: G.font, transition: "border-color 0.15s", width: "100%" },
  inputGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" },
  input: { width: "100%", background: G.surface, border: `1px solid ${G.border}`, borderRadius: 8, padding: "11px 14px", fontSize: 14, color: G.text, fontFamily: G.font, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 36 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>;
}

function StatusBadge({ status }) {
  const map = { delivered: { bg: "rgba(0,230,118,0.1)", color: G.green, text: "Delivered" }, pending: { bg: "rgba(251,191,36,0.1)", color: G.yellow, text: "Pending" }, failed: { bg: "rgba(248,113,113,0.1)", color: G.red, text: "Failed" }, funded: { bg: "rgba(41,182,246,0.1)", color: G.blue, text: "Funded" }, processing: { bg: "rgba(251,191,36,0.1)", color: G.yellow, text: "Processing" } };
  const s = map[status] || map.pending;
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontFamily: G.mono, fontWeight: 500, padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>{s.text}</span>;
}

function Input({ label, type = "text", placeholder, value, onChange, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={css.inputGroup}>
      {label && <label style={css.label}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...css.input, borderColor: focused ? G.green : G.border }} />
      {hint && <div style={{ fontSize: 10, color: G.muted, marginTop: 5, fontFamily: G.mono }}>{hint}</div>}
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.3)`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: G.red, fontFamily: G.mono, marginBottom: 16 }}>⚠ {msg}</div>;
}

function Spinner() {
  return <div style={{ textAlign: "center", padding: 40, color: G.muted, fontSize: 13, fontFamily: G.mono }}>Loading...</div>;
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ email: form.email, password: form.password, full_name: form.full_name, phone: form.phone });
      localStorage.setItem("ks_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: G.font, padding: 24 }}>
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: G.green, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 12px", boxShadow: `0 0 32px ${G.greenG}` }}>💸</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Tembo<span style={{ color: G.green }}>Swift</span></div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 4, fontFamily: G.mono }}>Fast · Transparent · Reliable</div>
        </div>
        <div style={{ ...css.card, padding: 32 }}>
          <div style={{ display: "flex", background: G.surface, borderRadius: 8, padding: 3, marginBottom: 28 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: 8, border: "none", borderRadius: 6, cursor: "pointer", background: mode === m ? G.card : "transparent", color: mode === m ? G.text : G.muted, fontSize: 13, fontWeight: mode === m ? 600 : 400, fontFamily: G.font, transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <ErrorBox msg={error} />
          {mode === "signup" && <Input label="Full Name" placeholder="John Otieno" value={form.full_name} onChange={set("full_name")} />}
          {mode === "signup" && <Input label="Phone" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={set("phone")} />}
          <Input label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
          <button onClick={handleSubmit} disabled={loading} style={{ ...css.btnPrimary, opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: G.muted, marginTop: 20, fontFamily: G.mono }}>
            {mode === "login" ? "New here? " : "Have an account? "}
            <span style={{ color: G.green, cursor: "pointer" }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 10, color: G.muted, fontFamily: G.mono }}>
          Regulated · FinCEN Registered · 256-bit Encrypted
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onNavigate }) {
  const [transfers, setTransfers] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.transfers(), api.quote(200)])
      .then(([t, q]) => { setTransfers(t.transfers || []); setQuote(q); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSent = transfers.filter(t => t.status === "delivered").reduce((a, t) => a + parseFloat(t.amount_usd), 0);
  const recentTx = transfers.slice(0, 3);
  const colors = ["#00e676", "#29b6f6", "#fb923c", "#a78bfa", "#34d399"];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0a1f12 0%, #0c1a25 100%)", border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(0,230,118,0.06)" }} />
        <div style={{ fontSize: 12, color: G.muted, fontFamily: G.mono, marginBottom: 6 }}>WELCOME BACK</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{user.full_name?.split(" ")[0]} 👋</div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 4, letterSpacing: "0.1em" }}>TOTAL SENT</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: G.green, fontFamily: G.mono }}>${totalSent.toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 4, letterSpacing: "0.1em" }}>TRANSFERS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: G.mono }}>{transfers.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 4, letterSpacing: "0.1em" }}>LIVE RATE</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: G.blue, fontFamily: G.mono }}>
              {quote ? `1 USD = ${quote.mid_rate} KES` : "Loading..."}
            </div>
          </div>
        </div>
        {user.kyc_status !== "approved" && (
          <div style={{ marginTop: 16, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: G.yellow, fontFamily: G.mono }}>
            ⚠ KYC verification required to send money — complete it in Settings
          </div>
        )}
        <button onClick={() => onNavigate("send")} style={{ ...css.btnPrimary, width: "auto", marginTop: 20, padding: "12px 28px" }}>
          Send Money →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {[{ icon: "💸", label: "Send", nav: "send", color: G.green }, { icon: "👥", label: "Recipients", nav: "recipients", color: G.blue }, { icon: "📋", label: "History", nav: "history", color: G.orange }].map(a => (
          <div key={a.nav} onClick={() => onNavigate(a.nav)}
            style={{ ...css.card, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s, transform 0.15s", padding: "20px 12px" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</div>
          </div>
        ))}
      </div>

      <div style={css.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Recent Transfers</div>
          <span onClick={() => onNavigate("history")} style={{ fontSize: 12, color: G.green, cursor: "pointer" }}>View all →</span>
        </div>
        {loading ? <Spinner /> : recentTx.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: G.muted, fontSize: 13 }}>No transfers yet — send your first one!</div>
        ) : recentTx.map((tx, i) => (
          <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < recentTx.length - 1 ? `1px solid ${G.border}` : "none" }}>
            <Avatar initials={(tx.recipient_name || "??").split(" ").map(w => w[0]).join("").slice(0, 2)} color={colors[i % colors.length]} size={38} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.recipient_name}</div>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString()} · {tx.delivery_method}</div>
            </div>
            <div style={{ textAlign: "right", marginRight: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: G.mono }}>-${parseFloat(tx.amount_usd).toFixed(0)}</div>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono }}>KES {parseFloat(tx.amount_kes).toLocaleString()}</div>
            </div>
            <StatusBadge status={tx.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEND MONEY ───────────────────────────────────────────────────────────────
function SendMoney({ user }) {
  const [step, setStep] = useState(1);
  const [usd, setUsd] = useState("200");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [recipientId, setRecipientId] = useState(null);
  const [method, setMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transfer, setTransfer] = useState(null);

  useEffect(() => { api.recipients().then(r => { setRecipients(r.recipients || []); if (r.recipients?.length) setRecipientId(r.recipients[0].id); }); }, []);

  useEffect(() => {
    if (!usd || parseFloat(usd) < 5) return;
    setQuoteLoading(true);
    const timer = setTimeout(() => {
      api.quote(usd).then(setQuote).catch(() => {}).finally(() => setQuoteLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [usd]);

  const recipient = recipients.find(r => r.id === recipientId);
  const colors = ["#00e676", "#29b6f6", "#fb923c", "#a78bfa"];

  const handleCreate = async () => {
    if (!recipientId) return setError("Please select a recipient");
    if (user.kyc_status !== "approved") return setError("KYC verification required. Please complete identity verification first.");
    setError(""); setLoading(true);
    try {
      const data = await api.createTransfer({ recipient_id: recipientId, amount_usd: parseFloat(usd) });
      setTransfer(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 4 && transfer) return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Transfer Created!</div>
      <div style={{ fontSize: 13, color: G.muted, fontFamily: G.mono, marginBottom: 24 }}>
        Payment pending — complete it with Stripe below
      </div>
      <div style={{ ...css.card, marginBottom: 20, textAlign: "left" }}>
        {[
          ["Transfer ID", transfer.transfer?.id?.slice(0, 8) + "..."],
          ["Amount", `$${transfer.quote?.amount_usd} USD`],
          ["Fee", `$${transfer.quote?.fee_usd}`],
          ["Rate", `1 USD = ${transfer.quote?.client_rate} KES`],
          ["Recipient Gets", `KES ${parseFloat(transfer.quote?.amount_kes).toLocaleString()}`],
          ["Status", transfer.transfer?.status],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${G.border}` }}>
            <span style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: G.text }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(0,230,118,0.08)", border: `1px solid rgba(0,230,118,0.2)`, borderRadius: 8, padding: "12px 14px", fontSize: 11, color: G.green, fontFamily: G.mono, marginBottom: 20 }}>
        ✓ Transfer queued · Payment required to process payout
      </div>
      <button onClick={() => { setStep(1); setTransfer(null); }} style={css.btnPrimary}>Send Another Transfer</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Send Money</div>
        <div style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>🇺🇸 USD → 🇰🇪 KES · M-Pesa or Bank</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {["Amount", "Recipient", "Confirm"].map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: step > i+1 ? G.green : step === i+1 ? G.greenG : G.surface, border: `1px solid ${step >= i+1 ? G.green : G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: step > i+1 ? "#000" : step === i+1 ? G.green : G.muted, fontFamily: G.mono }}>
              {step > i+1 ? "✓" : i+1}
            </div>
            <div style={{ fontSize: 11, color: step === i+1 ? G.text : G.muted, fontWeight: step === i+1 ? 600 : 400 }}>{s}</div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > i+1 ? G.green : G.border }} />}
          </div>
        ))}
      </div>

      <div style={css.card}>
        <ErrorBox msg={error} />

        {step === 1 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 20 }}>How much to send?</div>
            <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: 20, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginBottom: 8, letterSpacing: "0.1em" }}>YOU SEND (USD)</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: G.muted }}>$</span>
                <input type="number" value={usd} onChange={e => setUsd(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 48, fontWeight: 800, color: "#fff", fontFamily: G.mono, width: 180, textAlign: "center" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[50, 100, 200, 500].map(n => (
                <button key={n} onClick={() => setUsd(String(n))}
                  style={{ flex: 1, padding: 8, border: `1px solid ${usd == n ? G.green : G.border}`, background: usd == n ? G.greenG : "transparent", color: usd == n ? G.green : G.muted, borderRadius: 6, cursor: "pointer", fontFamily: G.mono, fontSize: 12, fontWeight: 600 }}>${n}</button>
              ))}
            </div>
            <div style={{ background: G.surface, borderRadius: 10, padding: 16 }}>
              {quoteLoading ? <div style={{ textAlign: "center", color: G.muted, fontSize: 12, fontFamily: G.mono }}>Fetching live rate...</div> : quote ? [
                ["Exchange Rate", `1 USD = ${quote.mid_rate} KES`],
                ["Transfer Fee", "Free ?"],
                ["Recipient Gets", `KES ${parseFloat(quote.amount_kes).toLocaleString()}`],
              ].map(([k, v], i, a) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < a.length - 1 ? `1px solid ${G.border}` : "none" }}>
                  <span style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: i === 2 ? 700 : 600, color: i === 2 ? G.green : G.text }}>{v}</span>
                </div>
              )) : null}
            </div>
            <div style={{ height: 20 }} />
            <button onClick={() => setStep(2)} disabled={!quote || parseFloat(usd) < 5} style={{ ...css.btnPrimary, opacity: !quote || parseFloat(usd) < 5 ? 0.4 : 1 }}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Who are you sending to?</div>
            {recipients.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: G.muted, fontSize: 13 }}>No recipients yet — add one in the Recipients tab first.</div>
            ) : recipients.map((r, i) => (
              <div key={r.id} onClick={() => setRecipientId(r.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 10, marginBottom: 8, border: `1px solid ${recipientId === r.id ? G.green : G.border}`, background: recipientId === r.id ? G.greenG : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                <Avatar initials={r.full_name.split(" ").map(w => w[0]).join("").slice(0, 2)} color={colors[i % colors.length]} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.full_name}</div>
                  <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginTop: 2 }}>{r.phone} · {r.delivery_method}</div>
                </div>
                {recipientId === r.id && <span style={{ color: G.green, fontSize: 18 }}>✓</span>}
              </div>
            ))}
            <div style={{ height: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...css.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!recipientId} style={{ ...css.btnPrimary, flex: 2, opacity: !recipientId ? 0.4 : 1 }}>Review Transfer →</button>
            </div>
          </>
        )}

        {step === 3 && recipient && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Review & Confirm</div>
            <div style={{ background: G.surface, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: `1px solid ${G.border}`, marginBottom: 14 }}>
                <Avatar initials={recipient.full_name.split(" ").map(w => w[0]).join("").slice(0, 2)} color={G.green} size={44} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{recipient.full_name}</div>
                  <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono }}>{recipient.phone}</div>
                </div>
              </div>
              {[
                ["You Pay", `$${usd} USD`],
                ["Fee", `$${quote?.fee_usd}`],
                ["Rate", `1 USD = ${quote?.client_rate} KES`],
                ["Recipient Gets", `KES ${parseFloat(quote?.amount_kes || 0).toLocaleString()}`],
                ["Delivery", recipient.delivery_method === "mpesa" ? "M-Pesa · ~2 mins" : "Bank · 1-2 days"],
              ].map(([k, v], i, a) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < a.length - 1 ? `1px solid ${G.border}` : "none" }}>
                  <span style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: i === 3 ? 700 : 600, color: i === 3 ? G.green : G.text }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(0,230,118,0.05)", border: `1px solid rgba(0,230,118,0.2)`, borderRadius: 8, padding: "12px 14px", fontSize: 11, color: G.green, fontFamily: G.mono, marginBottom: 20 }}>
              ✓ Sanctions check · ✓ Fraud scoring · ✓ AML velocity check — all run on payment
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ ...css.btnSecondary, flex: 1 }}>← Back</button>
              <button onClick={handleCreate} disabled={loading} style={{ ...css.btnPrimary, flex: 2, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creating..." : `Confirm & Send $${usd}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── RECIPIENTS ───────────────────────────────────────────────────────────────
function Recipients() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", delivery_method: "mpesa" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const colors = ["#00e676", "#29b6f6", "#fb923c", "#a78bfa", "#34d399"];
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(() => {
    api.recipients().then(r => setList(r.recipients || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addRecipient = async () => {
    setError(""); setSaving(true);
    try {
      await api.addRecipient(form);
      setForm({ full_name: "", phone: "", delivery_method: "mpesa" });
      setShowAdd(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecipient = async (id) => {
    if (!window.confirm("Delete this recipient?")) return;
    await api.deleteRecipient(id);
    load();
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Recipients</div>
          <div style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>{list.length} saved recipients in Kenya</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ ...css.btnPrimary, width: "auto", padding: "10px 18px", fontSize: 13 }}>+ Add Recipient</button>
      </div>

      {showAdd && (
        <div style={{ ...css.card, marginBottom: 20, borderColor: G.greenD }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 18 }}>New Recipient</div>
          <ErrorBox msg={error} />
          <Input label="Full Name" placeholder="Grace Wanjiku" value={form.full_name} onChange={set("full_name")} />
          <Input label="M-Pesa / Phone Number" placeholder="+254712345678" value={form.phone} onChange={set("phone")} />
          <div style={css.inputGroup}>
            <label style={css.label}>Delivery Method</label>
            <select value={form.delivery_method} onChange={e => set("delivery_method")(e.target.value)}
              style={{ ...css.input, appearance: "none", cursor: "pointer" }}>
              <option value="mpesa">📱 M-Pesa Wallet</option>
              <option value="bank">🏦 Bank Transfer</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={{ ...css.btnSecondary, flex: 1 }}>Cancel</button>
            <button onClick={addRecipient} disabled={saving} style={{ ...css.btnPrimary, flex: 2, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save Recipient"}
            </button>
          </div>
        </div>
      )}

      <div style={css.card}>
        {loading ? <Spinner /> : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: G.muted, fontSize: 13 }}>No recipients yet — add one above.</div>
        ) : list.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < list.length - 1 ? `1px solid ${G.border}` : "none" }}>
            <Avatar initials={r.full_name.split(" ").map(w => w[0]).join("").slice(0, 2)} color={colors[i % colors.length]} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.full_name}</div>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginTop: 2 }}>{r.phone}</div>
            </div>
            <div style={{ fontSize: 10, fontFamily: G.mono, padding: "3px 8px", borderRadius: 4, background: r.delivery_method === "mpesa" ? "rgba(0,230,118,0.1)" : "rgba(41,182,246,0.1)", color: r.delivery_method === "mpesa" ? G.green : G.blue }}>
              {r.delivery_method === "mpesa" ? "M-Pesa" : "Bank"}
            </div>
            <button onClick={() => deleteRecipient(r.id)}
              style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.muted, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: G.font }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function History() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const colors = ["#00e676", "#29b6f6", "#fb923c", "#a78bfa", "#34d399"];

  useEffect(() => { api.transfers().then(t => setTransfers(t.transfers || [])).finally(() => setLoading(false)); }, []);

  const shown = filter === "all" ? transfers : transfers.filter(t => t.status === filter);
  const total = transfers.filter(t => t.status === "delivered").reduce((a, t) => a + parseFloat(t.amount_usd), 0);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Transaction History</div>
        <div style={{ fontSize: 12, color: G.muted, fontFamily: G.mono }}>${total.toFixed(0)} total delivered · {transfers.length} transfers</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Sent", val: `$${total.toFixed(0)}`, color: G.green },
          { label: "Transfers", val: transfers.length, color: G.blue },
          { label: "Delivered", val: transfers.filter(t => t.status === "delivered").length, color: G.orange },
        ].map(s => (
          <div key={s.label} style={{ ...css.card, padding: 18 }}>
            <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 6, letterSpacing: "0.08em" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: G.mono }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["all", "delivered", "pending", "processing", "failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 14px", border: `1px solid ${filter === f ? G.green : G.border}`, background: filter === f ? G.greenG : "transparent", color: filter === f ? G.green : G.muted, borderRadius: 6, cursor: "pointer", fontFamily: G.mono, fontSize: 11, fontWeight: filter === f ? 600 : 400, textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>
      <div style={css.card}>
        {loading ? <Spinner /> : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: G.muted, fontSize: 13 }}>No transactions found.</div>
        ) : shown.map((tx, i) => (
          <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < shown.length - 1 ? `1px solid ${G.border}` : "none" }}>
            <Avatar initials={(tx.recipient_name || "??").split(" ").map(w => w[0]).join("").slice(0, 2)} color={colors[i % colors.length]} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.recipient_name}</div>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, marginTop: 2 }}>
                {new Date(tx.created_at).toLocaleDateString()} · {tx.delivery_method} · #{tx.id.slice(0, 8)}
              </div>
            </div>
            <div style={{ textAlign: "right", marginRight: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: G.mono }}>-${parseFloat(tx.amount_usd).toFixed(0)}</div>
              <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono }}>KES {parseFloat(tx.amount_kes).toLocaleString()}</div>
            </div>
            <StatusBadge status={tx.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ks_token");
    if (token) {
      api.me().then(d => setUser(d.user)).catch(() => localStorage.removeItem("ks_token")).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const logout = () => { localStorage.removeItem("ks_token"); setUser(null); setPage("dashboard"); };

  const NAV = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "send",      icon: "💸", label: "Send Money" },
    { id: "recipients",icon: "👥", label: "Recipients" },
    { id: "history",   icon: "📋", label: "History" },
    { id: "support",   icon: "⚙️",  label: "Account" },
  ];

  if (window.location.pathname === '/admin') return <AdminDashboard />;
  if (checking) return <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted, fontFamily: G.mono }}>Loading...</div>;
  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div style={css.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1c2a35; border-radius: 2px; }
        select option { background: #0c1017; color: #e2edf5; }
        @media (max-width: 700px) { .sidebar-desktop { display: none !important; } .main-pad { padding: 20px 16px !important; } }
      `}</style>

      <div style={css.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Tembo<span style={{ color: G.green }}>Swift</span></div>
          <div style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 4, padding: "2px 8px", fontSize: 9, color: G.green, fontFamily: G.mono, letterSpacing: "0.1em" }}>LIVE</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user.kyc_status !== "approved" && (
            <div style={{ fontSize: 10, color: G.yellow, fontFamily: G.mono, background: "rgba(251,191,36,0.1)", padding: "3px 8px", borderRadius: 4 }}>KYC PENDING</div>
          )}
          <Avatar initials={user.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2) || "U"} color={G.green} size={30} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name?.split(" ")[0]}</span>
        </div>
      </div>

      <div style={css.shell}>
        <div style={css.sidebar} className="sidebar-desktop">
          <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${G.border}`, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em" }}>NAVIGATION</div>
          </div>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)} style={css.navItem(page === n.id)}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: "0 24px" }}>
            <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, color: G.muted, fontFamily: G.mono, marginBottom: 8 }}>ACCOUNT</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", color: G.muted, fontSize: 12 }}>
                <span>🪪</span><span>KYC: <span style={{ color: user.kyc_status === "approved" ? G.green : G.yellow }}>{user.kyc_status}</span></span>
              </div>
              <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", color: G.muted, fontSize: 12 }}>
                <span>🚪</span><span>Sign Out</span>
              </div>
            </div>
          </div>
        </div>

        <div style={css.main} className="main-pad">
          {page === "dashboard"   && <Dashboard user={user} onNavigate={setPage} />}
          {page === "send"        && <SendMoney user={user} />}
          {page === "recipients"  && <Recipients />}
          {page === "history" && <History />}
          {page === "support" && <Support user={user} onLogout={logout} onNavigate={setPage} />}
        </div>
      </div>

      <style>{`@media (min-width: 701px) { .mobile-nav { display: none !important; } }`}</style>
      <div className="mobile-nav" style={{ display: "flex", background: G.surface, borderTop: `1px solid ${G.border}`, padding: "8px 0 4px" }}>
        {NAV.map(n => (
          <div key={n.id} onClick={() => setPage(n.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", cursor: "pointer", color: page === n.id ? G.green : G.muted }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontFamily: G.mono, fontWeight: page === n.id ? 600 : 400 }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}function Support({ user, onLogout, onNavigate }) {
  const parseAddress = (addr) => {
    if (!addr) return { street: "", city: "", state: "", zip: "", country: "United States" };
    const parts = addr.split(",").map(s => s.trim());
    return { street: parts[0] || "", city: parts[1] || "", state: parts[2] || "", zip: parts[3] || "", country: parts[4] || "United States" };
  };
  const [fields, setFields] = useState({ full_name: (user && user.full_name) || "", date_of_birth: (user && user.date_of_birth ? user.date_of_birth.substring(0,10) : ""), ...parseAddress(user && user.address) });
  const buildAddress = (f) => [f.street, f.city, f.state, f.zip, f.country].filter(Boolean).join(", ");
  const [phone, setPhone] = useState((user && user.phone) || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const tok = localStorage.getItem("ks_token");
  const hdrs = { "Content-Type": "application/json", Authorization: "Bearer " + tok };
  const saveProfile = async () => { setProfileSaving(true); try { await fetch("https://temboswift-backend.onrender.com/api/auth/me", { method: "PUT", headers: hdrs, body: JSON.stringify({ ...fields, address: buildAddress(fields) }) }); setProfileMsg("Profile saved!"); setProfileSaving(false); setTimeout(() => { setProfileMsg(""); window.location.reload(); }, 1500); } catch(e) { setProfileSaving(false); } };
  const sendOtp = async () => { setProfileSaving(true); try { await fetch("https://temboswift-backend.onrender.com/api/auth/phone/send-otp", { method: "POST", headers: hdrs, body: JSON.stringify({ phone }) }); setOtpSent(true); setProfileMsg("Code sent!"); setProfileSaving(false); } catch(e) { setProfileSaving(false); } };
  const verifyOtp = async () => { setProfileSaving(true); try { const res = await fetch("https://temboswift-backend.onrender.com/api/auth/phone/verify-otp", { method: "POST", headers: hdrs, body: JSON.stringify({ otp }) }); const data = await res.json(); if (data.message) { setProfileMsg("Phone verified!"); setTimeout(() => window.location.reload(), 1500); } else { setProfileMsg("Invalid code"); } setProfileSaving(false); } catch(e) { setProfileSaving(false); } };
  const [openFaq, setOpenFaq] = useState(null);
  
  const [activeSection, setActiveSection] = useState(null);
  const faqs = [
    { q: "How long does a transfer take?", a: "Most M-Pesa transfers arrive in under 2 minutes. Bank transfers take 1-2 business days." },
    { q: "What are your fees?", a: "Flat fee: \$2.99 under \$100, \$3.99 for \$100-\$199, \$4.99 for \$200+. No hidden fees." },
    { q: "What is the exchange rate?", a: "Live mid-market rate with 1.5% spread. You always see the exact rate before confirming." },
    { q: "How do I send to M-Pesa?", a: "Add recipient with Kenyan phone (+254...), select M-Pesa delivery, and send." },
    { q: "What is the maximum transfer amount?", a: "Maximum single transfer is \$10,000." },
    { q: "Is my money safe?", a: "Yes. 256-bit encryption, Stripe payments, sanctions and fraud checks on every transfer." },
    { q: "What if my transfer fails?", a: "Payment is not charged if transfer fails. You receive an email with the reason." },
  ];
  const initials = user?.full_name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "U";
  if (activeSection === "personal") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>back</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Personal Details</div>
      </div>
      {profileMsg && <div style={{ background: G.greenG, border: "1px solid " + G.green, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: G.green, marginBottom: 16 }}>{profileMsg}</div>}
      <div style={{ ...css.card, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em", marginBottom: 16 }}>BASIC INFO</div>
        {[["Full Name", "full_name", "text", "Your legal name"], ["Date of Birth", "date_of_birth", "date", ""]].map(([label, key, type, placeholder]) => (
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
  );
    if (activeSection === "limits") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Transfer Limits</div>
      </div>
      <div style={css.card}>
        {[["Single transfer", "\$10,000"], ["Daily limit", "\$10,000"], ["Monthly limit", "\$50,000"], ["Minimum transfer", "\$5"]].map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid " + G.border }}>
            <span style={{ fontSize: 13, color: G.muted }}>{k}</span>
            <span style={{ fontSize: 13, color: G.green, fontWeight: 700, fontFamily: G.mono }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
  if (activeSection === "faqs") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>FAQs</div>
      </div>
      <div style={css.card}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid " + G.border : "none" }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", cursor: "pointer" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: G.text, paddingRight: 16, flex: 1 }}>{faq.q}</div>
              <span style={{ color: G.muted, fontSize: 18 }}>{openFaq === i ? "−" : "+"}</span>
            </div>
            {openFaq === i && <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.7, paddingBottom: 16 }}>{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
  if (activeSection === "contact") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Contact Support</div>
      </div>
      <div style={css.card}>
        {[
          { icon: "💬", label: "Chat live", sub: "Available 24/7", action: () => window.$crisp && window.$crisp.push(["do", "chat:open"]) },
          { icon: "📧", label: "Email us", sub: "support@temboswift.com", action: () => window.open("mailto:support@temboswift.com") },
          { icon: "📞", label: "Call us", sub: "Mon-Fri 9AM-6PM EST", action: () => window.open("tel:+12143045008") },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid " + G.border : "none", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: G.greenG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{item.label}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{item.sub}</div>
            </div>
            <span style={{ color: G.muted }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
  if (activeSection === "legal") return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => setActiveSection(null)} style={{ background: "transparent", border: "none", color: G.muted, cursor: "pointer", fontSize: 22 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Legal Information</div>
      </div>
      <div style={css.card}>
        {[
          { icon: "🔏", label: "Privacy Policy", url: "https://temboswift.com/privacy.html" },
          { icon: "📋", label: "Terms of Service", url: "https://temboswift.com/terms.html" },
          { icon: "⚖️", label: "Licenses", url: "https://temboswift.com/privacy.html" },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={() => window.open(item.url)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid " + G.border : "none", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{item.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{item.label}</div></div>
            <span style={{ color: G.muted }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: G.greenG, border: "2px solid " + G.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: G.green, margin: "0 auto 12px" }}>{initials}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{user?.full_name || "User"}</div>
        <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>{user?.email}</div>
      </div>
      <div style={{ ...css.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em", marginBottom: 4 }}>ACCOUNT</div>
        {[
          { icon: "👤", label: "Personal Details", sub: "Name, email, phone", action: () => setActiveSection("personal") },
          { icon: "📊", label: "Transfer Limits", sub: "$10,000 per transfer", action: () => setActiveSection("limits") },
          { icon: "💳", label: "Manage Cards", sub: "Added when you transfer", action: null },
          { icon: "🪪", label: "KYC Verification", sub: user?.kyc_status === "approved" ? "✅ Verified" : "⚠️ Action required", action: () => onNavigate("kyc") },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={item.action || undefined} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid " + G.border : "none", cursor: item.action ? "pointer" : "default" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{item.label}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{item.sub}</div>
            </div>
            <span style={{ color: G.muted }}>›</span>
          </div>
        ))}
      </div>
      <div style={{ ...css.card, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: G.muted, fontFamily: G.mono, letterSpacing: "0.1em", marginBottom: 4 }}>SUPPORT</div>
        {[
          { icon: "💬", label: "Contact Support", sub: "Chat, email or call us", action: () => setActiveSection("contact") },
          { icon: "❓", label: "FAQs", sub: "Common questions answered", action: () => setActiveSection("faqs") },
        ].map((item, i, arr) => (
          <div key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid " + G.border : "none", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: G.greenG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{item.label}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{item.sub}</div>
            </div>
            <span style={{ color: G.muted }}>›</span>
          </div>
        ))}
      </div>
      <div style={{ ...css.card, marginBottom: 12 }}>
        <div onClick={() => setActiveSection("legal")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚖️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>Legal Information</div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Privacy, Terms & Compliance</div>
          </div>
          <span style={{ color: G.muted }}>›</span>
        </div>
      </div>
      <div style={{ ...css.card, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + G.border }}>
          <span style={{ fontSize: 13, color: G.muted }}>Version</span>
          <span style={{ fontSize: 13, color: G.text, fontFamily: G.mono }}>1.0.0</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
          <span style={{ fontSize: 13, color: G.muted }}>🐘 TemboSwift</span>
          <span style={{ fontSize: 13, color: G.muted }}>US → Kenya</span>
        </div>
      </div>
      <button onClick={onLogout} style={{ width: "100%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 600, color: "#f87171", cursor: "pointer", marginBottom: 40 }}>
        Sign Out
      </button>
    </div>
  );
}








