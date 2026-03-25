const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

// 1. Add Stripe import at top after existing import
if (!content.includes('loadStripe')) {
  content = content.replace(
    `import { useState, useEffect, useCallback } from "react";`,
    `import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_live_51T6QLQGZ5hG9oDBuQCrGqyDiBr2yW4uAhx7fZ8xZE6S6qglqvRluTzV2mLg08780HkeyYiZaTPS Kq6gYtHok80Hq00w6fVLRD8".replace(/ /g,""));`
  );
}

// 2. Add card API methods if not present
if (!content.includes('getCard:')) {
  content = content.replace(
    `  kycStart: () => api.req("/kyc/start", { method: "POST" }),`,
    `  kycStart: () => api.req("/kyc/start", { method: "POST" }),
  getCard: () => api.req("/cards"),
  setupCard: () => api.req("/cards/setup", { method: "POST" }),
  saveCard: (payment_method_id) => api.req("/cards/save", { method: "POST", body: JSON.stringify({ payment_method_id }) }),
  deleteCard: () => api.req("/cards", { method: "DELETE" }),`
  );
}

// 3. Replace the broken addCard function with proper Stripe Elements
const oldManageCards = content.match(/function ManageCards[\s\S]*?^}/m);

const newManageCards = `function StripeCardForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!stripe || !elements) return;
    setLoading(true); setError("");
    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) { setError(result.error.message); setLoading(false); return; }
      await api.saveCard(result.setupIntent.payment_method);
      onSuccess();
    } catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div>
      {error && <div style={{ background: G.redLight, color: G.red, padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontSize: 13 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      <div style={{ border: \`1.5px solid \${G.green}\`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, background: "#fff" }}>
        <CardElement options={{ style: { base: { fontSize: "16px", color: "#111", fontFamily: "DM Sans, sans-serif", "::placeholder": { color: "#999" } }, invalid: { color: "#dc2626" } } }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} full><i className="fas fa-times"></i> Cancel</Btn>
        <Btn onClick={handleSave} disabled={loading || !stripe} full>
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-lock"></i> Save Card</>}
        </Btn>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: G.light, textAlign: "center" }}>
        <i className="fas fa-shield-alt"></i> Secured by Stripe · 256-bit encryption
      </div>
    </div>
  );
}

function ManageCards({ user, onBack }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    api.getCard().then(d => setCard(d.card)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const startAdd = async () => {
    setSetupLoading(true);
    try {
      const d = await api.setupCard();
      setClientSecret(d.client_secret);
      setShowAdd(true);
    } catch (e) { alert(e.message); }
    finally { setSetupLoading(false); }
  };

  const removeCard = async () => {
    if (!window.confirm("Remove this card?")) return;
    await api.deleteCard().catch(() => {});
    setCard(null);
  };

  const brandIcons = { visa: "fab fa-cc-visa", mastercard: "fab fa-cc-mastercard", amex: "fab fa-cc-amex", discover: "fab fa-cc-discover" };

  return (
    <div style={{ fontFamily: G.font }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <i className="fas fa-arrow-left"></i> Back
      </button>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}><i className="fas fa-credit-card" style={{ color: G.green, marginRight: 8 }}></i>Manage Cards</div>

      {loading ? <div style={{ textAlign: "center", padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: G.muted }}></i></div>
      : card ? (
        <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <i className={brandIcons[card.brand] || "fas fa-credit-card"} style={{ color: "#fff", fontSize: 36 }}></i>
            <span style={{ background: "rgba(76,222,143,0.2)", color: "#4cde8f", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>DEFAULT</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: 4, marginBottom: 20 }}>•••• •••• •••• {card.last4}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>EXPIRES</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{String(card.exp_month).padStart(2,"0")}/{card.exp_year}</div>
            </div>
            <button onClick={removeCard} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <i className="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        </Card>
      ) : (
        <Card style={{ textAlign: "center", padding: 32, marginBottom: 16 }}>
          <i className="fas fa-credit-card" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
          <div style={{ color: G.muted, marginBottom: 4 }}>No card saved</div>
          <div style={{ fontSize: 13, color: G.light }}>Add a card for one-tap transfers</div>
        </Card>
      )}

      {!card && !showAdd && (
        <Btn onClick={startAdd} disabled={setupLoading} full>
          {setupLoading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-plus"></i> Add New Card</>}
        </Btn>
      )}

      {showAdd && clientSecret && (
        <Card style={{ border: \`2px solid \${G.green}33\`, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.green, marginBottom: 16 }}><i className="fas fa-lock"></i> Enter Card Details</div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCardForm
              clientSecret={clientSecret}
              onSuccess={() => { setShowAdd(false); setClientSecret(null); api.getCard().then(d => setCard(d.card)).catch(() => {}); }}
              onCancel={() => { setShowAdd(false); setClientSecret(null); }}
            />
          </Elements>
        </Card>
      )}
    </div>
  );
}
`;

// Replace the old ManageCards function
const manageCardsStart = content.indexOf('function ManageCards(');
const accountStart = content.indexOf('// ── ACCOUNT ────────────────────────────────────────────────────────────────');

if (manageCardsStart !== -1 && manageCardsStart < accountStart) {
  // Find end of ManageCards function
  let braceCount = 0;
  let i = manageCardsStart;
  let started = false;
  while (i < content.length) {
    if (content[i] === '{') { braceCount++; started = true; }
    if (content[i] === '}') { braceCount--; }
    if (started && braceCount === 0) { i++; break; }
    i++;
  }
  content = content.substring(0, manageCardsStart) + newManageCards + '\n' + content.substring(i);
  console.log('Replaced existing ManageCards');
} else {
  content = content.replace(
    '// ── ACCOUNT ────────────────────────────────────────────────────────────────',
    newManageCards + '\n// ── ACCOUNT ────────────────────────────────────────────────────────────────'
  );
  console.log('Inserted new ManageCards');
}

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
