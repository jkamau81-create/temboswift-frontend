import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_live_51T6QLQGZ5hG9oDBuQCrGqyDiBr2yW4uAhx7fZ8xZE6S6qglqvRluTzV2mLg08780HkeyYiZaTPS Kq6gYtHok80Hq00w6fVLRD8".replace(/ /g,""));
const API = "https://temboswift-backend.onrender.com/api";

const G = { green: "#0b5e35", greenLight: "#f0faf5", border: "#e8e3d8", muted: "#666", light: "#999", text: "#111", red: "#dc2626", redLight: "#fef2f2" };

function CardForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!stripe || !elements) return;
    setLoading(true); setError("");
    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) { setError(result.error.message); setLoading(false); return; }
      const token = localStorage.getItem("ts_token");
      await fetch(`${API}/cards/save`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ payment_method_id: result.setupIntent.payment_method }) });
      setLoading(false);
      onSuccess();
    } catch(e) { setError(e.message); setLoading(false); }
  };

  return (
    <div>
      {error && <div style={{ background: G.redLight, color: G.red, padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontSize: 13 }}>{error}</div>}
      <div style={{ border: `1.5px solid ${G.green}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, background: "#fff" }}>
        <CardElement options={{ style: { base: { fontSize: "16px", color: G.text, fontFamily: "DM Sans, sans-serif", "::placeholder": { color: G.light } } } }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 100, border: `1px solid ${G.border}`, background: "transparent", color: G.muted, fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
        <button onClick={save} disabled={loading || !stripe} style={{ flex: 2, padding: "12px", borderRadius: 100, background: G.green, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1, fontFamily: "DM Sans, sans-serif" }}>
          {loading ? "Saving..." : "Save Card"}
        </button>
      </div>
    </div>
  );
}

export default function CardManager({ onBack }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const token = localStorage.getItem("ts_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const loadCard = () => {
    fetch(`${API}/cards`, { headers }).then(r => r.json()).then(d => setCard(d.card)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadCard(); }, []);

  const startAdd = async () => {
    setSetupLoading(true);
    try {
      const d = await fetch(`${API}/cards/setup`, { method: "POST", headers }).then(r => r.json());
      setClientSecret(d.client_secret);
      setShowAdd(true);
    } catch(e) { alert(e.message); }
    finally { setSetupLoading(false); }
  };

  const removeCard = async () => {
    if (!window.confirm("Remove this card?")) return;
    await fetch(`${API}/cards`, { method: "DELETE", headers });
    setCard(null);
  };

  const brandIcons = { visa: "fab fa-cc-visa", mastercard: "fab fa-cc-mastercard", amex: "fab fa-cc-amex", discover: "fab fa-cc-discover" };

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", padding: "0 0 40px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        ← Back
      </button>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
        <i className="fas fa-credit-card" style={{ color: G.green, marginRight: 8 }}></i>Manage Cards
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: G.muted }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
        </div>
      ) : card ? (
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: 24, marginBottom: 16, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <i className={brandIcons[card.brand] || "fas fa-credit-card"} style={{ fontSize: 36 }}></i>
            <span style={{ background: "rgba(76,222,143,0.2)", color: "#4cde8f", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>DEFAULT</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, marginBottom: 20 }}>
            •••• •••• •••• {card.last4}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>EXPIRES</div>
              <div style={{ fontWeight: 600 }}>{String(card.exp_month).padStart(2,"0")}/{card.exp_year}</div>
            </div>
            <button onClick={removeCard} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
              <i className="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 16 }}>
          <i className="fas fa-credit-card" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
          <div style={{ color: G.muted, marginBottom: 4 }}>No card saved</div>
          <div style={{ fontSize: 13, color: G.light }}>Add a card for one-tap transfers</div>
        </div>
      )}

      {!card && !showAdd && (
        <button onClick={startAdd} disabled={setupLoading} style={{ width: "100%", background: G.green, color: "#fff", border: "none", borderRadius: 100, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: setupLoading ? 0.7 : 1, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <i className="fas fa-plus"></i> {setupLoading ? "Loading..." : "Add New Card"}
        </button>
      )}

      {showAdd && clientSecret && (
        <div style={{ background: "#fff", border: `2px solid ${G.green}33`, borderRadius: 16, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.green, marginBottom: 16 }}>
            <i className="fas fa-lock"></i> Enter Card Details
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CardForm
              clientSecret={clientSecret}
              onSuccess={() => { setShowAdd(false); setClientSecret(null); loadCard(); }}
              onCancel={() => { setShowAdd(false); setClientSecret(null); }}
            />
          </Elements>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: G.light, textAlign: "center" }}>
        <i className="fas fa-shield-alt"></i> Secured by Stripe · We never see your card number
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20 }}>
        <i className="fab fa-cc-visa" style={{ fontSize: 36, color: "#1a1f71" }}></i>
        <i className="fab fa-cc-mastercard" style={{ fontSize: 36, color: "#eb001b" }}></i>
        <i className="fab fa-cc-amex" style={{ fontSize: 36, color: "#007bc1" }}></i>
        <i className="fab fa-cc-discover" style={{ fontSize: 36, color: "#ff6600" }}></i>
      </div>
    </div>
  );
}
