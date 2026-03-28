import { useState, useEffect, useRef } from "react";
import Receipt from "./Receipt";

const API = "https://temboswift-backend.onrender.com/api";
const G = { green: "#0b5e35", greenDark: "#093d28", greenMid: "#1a7a4a", greenLight: "#f0faf5", acc: "#f5a623", bg: "#f5f0e8", white: "#fff", border: "#e8e3d8", text: "#111", muted: "#666", light: "#999", red: "#dc2626", redLight: "#fef2f2", font: "'DM Sans', sans-serif" };

const COUNTRIES = [
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", currency: "KES" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬", currency: "UGX" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿", currency: "TZS" },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼", currency: "RWF" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", currency: "NGN" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", currency: "GHS" },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹", currency: "ETB" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦", currency: "ZAR" },
];

function req(path, opts = {}) {
  const token = localStorage.getItem("ts_token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  return fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } }).then(r => r.json());
}

function CountrySelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: G.bg, border: `1.5px solid ${open ? G.green : G.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontFamily: G.font, transition: "border-color 0.2s", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 22 }}>{selected.flag}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>{selected.dial}</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: 10, color: G.muted }}></i>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: G.white, border: `1px solid ${G.border}`, borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, width: 240, maxHeight: 300, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${G.border}` }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search country..." autoFocus
              style={{ width: "100%", border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: G.font, boxSizing: "border-box" }} />
          </div>
          <div style={{ overflowY: "auto" }}>
            {filtered.map(c => (
              <div key={c.code} onClick={() => { onSelect(c); setOpen(false); setSearch(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selected.code === c.code ? G.greenLight : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = G.greenLight}
                onMouseLeave={e => e.currentTarget.style.background = selected.code === c.code ? G.greenLight : "transparent"}>
                <span style={{ fontSize: 22 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>{c.dial}</div>
                </div>
                {selected.code === c.code && <i className="fas fa-check" style={{ color: G.green, fontSize: 12 }}></i>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SendMoney({ user, onDone }) {
  const [step, setStep] = useState(1);
  const [usd, setUsd] = useState("200");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [mpesaName, setMpesaName] = useState(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastTransfer, setLastTransfer] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fullPhone = country.dial + phoneLocal.replace(/^0/, "");

  useEffect(() => {
    const amt = parseFloat(usd);
    if (!amt || amt < 5) { setQuote(null); return; }
    setQuoteLoading(true);
    const t = setTimeout(() => {
      req(`/transfers/quote?amount=${amt}`).then(setQuote).catch(() => {}).finally(() => setQuoteLoading(false));
    }, 500);
    return () => clearTimeout(t);
  }, [usd]);

  useEffect(() => {
    req("/recipients").then(d => setSavedRecipients(d.recipients || [])).catch(() => {});
  }, []);

  const lookupName = async (localPhone) => {
    const cleaned = localPhone.replace(/\s|-/g, "");
    if (cleaned.length < 8) { setMpesaName(null); setNameError(""); return; }
    setNameLoading(true); setNameError(""); setMpesaName(null); setSelectedRecipient(null);
    await new Promise(r => setTimeout(r, 1200));
    const full = country.dial + cleaned.replace(/^0/, "");
    const saved = savedRecipients.find(r => r.phone.replace(/\s/g,"").includes(cleaned.slice(-9)));
    if (saved) {
      setMpesaName({ name: saved.full_name, verified: true });
      setSelectedRecipient(saved);
    } else if (cleaned.length >= 9) {
      setMpesaName({ name: "M-Pesa User", verified: false, note: "Daraja production required for live lookup" });
    } else {
      setNameError("Enter a valid phone number");
    }
    setNameLoading(false);
  };

  const send = async () => {
    if (user?.kyc_status !== "approved") { setError("Identity verification required. Go to Account → KYC Verification."); return; }
    setLoading(true); setError("");
    try {
      let recipientId = selectedRecipient?.id;
      if (!recipientId) {
        const r = await req("/recipients", { method: "POST", body: JSON.stringify({ full_name: mpesaName?.name || "Recipient", phone: fullPhone, delivery_method: "mpesa" }) });
        recipientId = r.recipient?.id || r.id;
      }
      const txResult = await req("/transfers", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, amount_usd: parseFloat(usd) }) });
      setLastTransfer({ ...txResult, amount_usd: usd, amount_kes: quote?.amount_kes, exchange_rate: quote?.client_rate, recipient_name: mpesaName?.name || selectedRecipient?.full_name, recipient_phone: fullPhone });
      setSuccess(true);
    } catch (e) { setError(e.message || "Transfer failed"); }
    finally { setLoading(false); }
  };

  if (success) return (
    <Receipt
      transfer={lastTransfer}
      onClose={() => { setSuccess(false); onDone && onDone(); }}
      onSendAnother={() => { setSuccess(false); setStep(1); setPhoneLocal(""); setMpesaName(null); setSelectedRecipient(null); }}
    />
  );


  return (
    <div style={{ fontFamily: G.font, maxWidth: 480 }}>
      {/* Steps */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 28 }}>
        {["Amount", "Recipient", "Confirm"].map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: step > i + 1 ? G.green : step === i + 1 ? G.green : G.border, color: step >= i + 1 ? "#fff" : G.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {step > i + 1 ? <i className="fas fa-check"></i> : i + 1}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: step === i + 1 ? G.green : G.muted }}>{label}</div>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? G.green : G.border, margin: "0 6px", marginBottom: 18 }}></div>}
          </div>
        ))}
      </div>

      {error && <div style={{ background: G.redLight, border: `1px solid ${G.red}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: G.red, display: "flex", gap: 8 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <div style={{ background: G.white, borderRadius: 16, border: `1px solid ${G.border}`, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>YOU SEND</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: G.green }}>$</span>
              <input value={usd} onChange={e => setUsd(e.target.value.replace(/[^0-9.]/g, ""))} type="text" inputMode="decimal"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 48, fontWeight: 900, color: G.text, fontFamily: G.font, background: "transparent", minWidth: 0 }} />
              <div style={{ background: G.bg, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>🇺🇸</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>USD</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[50, 100, 200, 500, 1000].map(n => (
                <button key={n} onClick={() => setUsd(String(n))}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 100, border: `1.5px solid ${usd === String(n) ? G.green : G.border}`, background: usd === String(n) ? G.greenLight : "transparent", color: usd === String(n) ? G.green : G.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: G.font }}>
                  ${n}
                </button>
              ))}
            </div>
          </div>

          {quoteLoading && (
            <div style={{ background: G.white, borderRadius: 16, border: `1px solid ${G.border}`, padding: 16, marginBottom: 12, textAlign: "center", color: G.muted, fontSize: 13 }}>
              <i className="fas fa-spinner fa-spin"></i> Getting live rate...
            </div>
          )}

          {quote && !quoteLoading && (
            <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMid})`, borderRadius: 16, padding: 20, marginBottom: 12, color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>RECIPIENT GETS</div>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>KES {parseFloat(quote.amount_kes).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>DELIVERY</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📱 ~2 min</div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                {[["Exchange rate", `1 USD = ${parseFloat(quote.client_rate).toFixed(2)} KES`], ["Transfer fee", "Free ✓"], ["Total you pay", `$${usd} USD`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setStep(2)} disabled={!quote || parseFloat(usd) < 5}
            style={{ width: "100%", background: G.green, color: "#fff", border: "none", borderRadius: 100, padding: "16px", fontSize: 16, fontWeight: 700, cursor: !quote || parseFloat(usd) < 5 ? "not-allowed" : "pointer", opacity: !quote || parseFloat(usd) < 5 ? 0.6 : 1, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Continue <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Who are you sending to?</div>

          {/* Saved recipients */}
          {savedRecipients.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Recent Recipients</div>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
                {savedRecipients.map(r => (
                  <div key={r.id} onClick={() => { setSelectedRecipient(r); setPhoneLocal(r.phone.replace(country.dial, "")); setMpesaName({ name: r.full_name, verified: true }); }}
                    style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: selectedRecipient?.id === r.id ? G.green : G.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: selectedRecipient?.id === r.id ? "#fff" : G.green, margin: "0 auto 6px", border: `2px solid ${selectedRecipient?.id === r.id ? G.green : "transparent"}` }}>
                      {r.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: selectedRecipient?.id === r.id ? G.green : G.text, maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.full_name.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${G.border}`, margin: "16px 0", position: "relative" }}>
                <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: G.bg, padding: "0 8px", fontSize: 12, color: G.muted }}>or enter number</span>
              </div>
            </div>
          )}

          {/* Phone input with country selector */}
          <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Sending to</div>
          <div style={{ background: G.white, borderRadius: 14, border: `1.5px solid ${mpesaName?.verified ? G.green : G.border}`, padding: "14px 16px", marginBottom: 12, transition: "border-color 0.2s" }}>
            <div style={{ fontSize: 11, color: G.muted, fontWeight: 600, marginBottom: 8 }}>COUNTRY & PHONE NUMBER</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CountrySelector selected={country} onSelect={(c) => { setCountry(c); setPhoneLocal(""); setMpesaName(null); setNameError(""); }} />
              <input value={phoneLocal} onChange={e => { setPhoneLocal(e.target.value); lookupName(e.target.value); setSelectedRecipient(null); }}
                placeholder="7XX XXX XXX" type="tel"
                style={{ flex: 1, border: "none", outline: "none", fontSize: 18, fontWeight: 600, color: G.text, fontFamily: G.font, background: "transparent", minWidth: 0 }} />
              {nameLoading && <i className="fas fa-spinner fa-spin" style={{ color: G.muted, flexShrink: 0 }}></i>}
              {mpesaName?.verified && <i className="fas fa-check-circle" style={{ color: G.green, fontSize: 20, flexShrink: 0 }}></i>}
            </div>
            {phoneLocal && <div style={{ fontSize: 12, color: G.muted, marginTop: 6 }}>Full number: {fullPhone}</div>}
          </div>

          {/* Name lookup result */}
          {nameLoading && (
            <div style={{ background: G.bg, borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 13, color: G.muted, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fas fa-spinner fa-spin"></i> Looking up M-Pesa account...
            </div>
          )}

          {mpesaName && !nameLoading && (
            <div style={{ background: mpesaName.verified ? G.greenLight : "#fef3c7", border: `1px solid ${mpesaName.verified ? G.green : "#f59e0b"}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: mpesaName.verified ? G.green : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {mpesaName.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{mpesaName.name}</div>
                  <div style={{ fontSize: 12, color: mpesaName.verified ? G.green : "#92400e", fontWeight: 600, marginTop: 2 }}>
                    {mpesaName.verified ? <><i className="fas fa-check-circle"></i> Verified M-Pesa account</> : <><i className="fas fa-exclamation-triangle"></i> {mpesaName.note}</>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {nameError && <div style={{ fontSize: 13, color: G.red, marginBottom: 12 }}><i className="fas fa-exclamation-circle"></i> {nameError}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", borderRadius: 100, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontWeight: 700, cursor: "pointer", fontFamily: G.font }}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <button onClick={() => setStep(3)} disabled={!mpesaName && !selectedRecipient}
              style={{ flex: 2, padding: "14px", borderRadius: 100, background: G.green, color: "#fff", border: "none", fontWeight: 700, cursor: !mpesaName && !selectedRecipient ? "not-allowed" : "pointer", opacity: !mpesaName && !selectedRecipient ? 0.6 : 1, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Review <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Review your transfer</div>
          <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMid})`, borderRadius: 20, padding: 24, marginBottom: 16, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>YOU SEND</div>
                <div style={{ fontSize: 36, fontWeight: 900 }}>${usd}</div>
              </div>
              <i className="fas fa-arrow-right" style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}></i>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>THEY RECEIVE</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#4cde8f" }}>KES {quote ? parseFloat(quote.amount_kes).toLocaleString() : ""}</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px" }}>
              {[["Rate", `1 USD = ${quote ? parseFloat(quote.client_rate).toFixed(2) : "..."} KES`], ["Fee", "Free ✓"], ["Delivery", "~2 min via M-Pesa"], ["Recipient", mpesaName?.name || selectedRecipient?.full_name || "—"], ["Phone", fullPhone]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {mpesaName && (
            <div style={{ background: G.greenLight, border: `1px solid ${G.green}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: G.green, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {mpesaName.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{mpesaName.name}</div>
                <div style={{ fontSize: 12, color: G.green }}><i className="fas fa-check-circle"></i> {country.flag} {fullPhone}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", borderRadius: 100, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontWeight: 700, cursor: "pointer", fontFamily: G.font }}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <button onClick={send} disabled={loading}
              style={{ flex: 2, padding: "14px", borderRadius: 100, background: G.green, color: "#fff", border: "none", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send ${usd}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


