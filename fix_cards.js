const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

// Add Stripe import at top
content = content.replace(
  "import { useState, useEffect, useCallback } from \"react\";",
  `import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_live_51T6QLQGZ5hG9oDBuQCrGqyDiBr2yW4uAhx7fZ8xZE6S6qglqvRluTzV2mLg08780HkeyYiZaTPS Kq6gYtHok80Hq00w6fVLRD8".replace(" ", ""));`
);

// Add card API methods
content = content.replace(
  "  kycStart: () => api.req(\"/kyc/start\", { method: \"POST\" }),",
  `  kycStart: () => api.req("/kyc/start", { method: "POST" }),
  getCard: () => api.req("/cards"),
  setupCard: () => api.req("/cards/setup", { method: "POST" }),
  saveCard: (payment_method_id) => api.req("/cards/save", { method: "POST", body: JSON.stringify({ payment_method_id }) }),
  deleteCard: () => api.req("/cards", { method: "DELETE" }),`
);

// Add CardSetupForm component before AuthScreen
const cardComponent = `
// ── CARD SETUP FORM ────────────────────────────────────────────────────────
function CardSetupForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true); setError("");
    try {
      const { data } = await api.setupCard().then(d => ({ data: d }));
      const result = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: { card: elements.getElement(CardElement), billing_details: {} }
      });
      if (result.error) { setError(result.error.message); setLoading(false); return; }
      await api.saveCard(result.setupIntent.payment_method);
      onSuccess();
    } catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div style={{ fontFamily: G.font }}>
      {error && <div style={{ background: G.redLight, color: G.red, padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      <div style={{ border: \`1.5px solid \${G.border}\`, borderRadius: 10, padding: "14px", marginBottom: 16, background: "#fff" }}>
        <CardElement options={{ style: { base: { fontSize: "16px", color: G.text, fontFamily: G.font, "::placeholder": { color: G.muted } } } }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} full><i className="fas fa-times"></i> Cancel</Btn>
        <Btn onClick={handleSubmit} disabled={loading || !stripe} full>
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-lock"></i> Save Card</>}
        </Btn>
      </div>
    </div>
  );
}

`;

content = content.replace(
  "// ── AUTH SCREEN ────────────────────────────────────────────────────────────────",
  cardComponent + "// ── AUTH SCREEN ────────────────────────────────────────────────────────────────"
);

// Update Manage Cards section in Account to show real card UI
content = content.replace(
  `{ icon: "fa-credit-card", label: "Manage Cards", sub: "Added when you transfer", section: null },`,
  `{ icon: "fa-credit-card", label: "Manage Cards", sub: "Add or remove payment cards", section: "cards" },`
);

// Add cards section handler in Account component
content = content.replace(
  `  if (section === "legal") return (`,
  `  if (section === "cards") return (
    <ManageCards user={user} onBack={() => setSection(null)} />
  );
  if (section === "legal") return (`
);

// Add ManageCards component before Account
const manageCardsComponent = `
// ── MANAGE CARDS ───────────────────────────────────────────────────────────
function ManageCards({ user, onBack }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    api.getCard().then(d => setCard(d.card)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const setupAdd = async () => {
    try {
      const d = await api.setupCard();
      setClientSecret(d.client_secret);
      setShowAdd(true);
    } catch (e) { alert(e.message); }
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

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: G.muted }}></i></div>
      ) : card ? (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 40, background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={brandIcons[card.brand] || "fas fa-credit-card"} style={{ color: "#fff", fontSize: 22 }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}>{card.brand} •••• {card.last4}</div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Expires {card.exp_month}/{card.exp_year}</div>
            </div>
            <span style={{ background: G.greenLight, color: G.green, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>DEFAULT</span>
          </div>
          <Btn variant="danger" onClick={removeCard} full small>
            <i className="fas fa-trash-alt"></i> Remove Card
          </Btn>
        </Card>
      ) : (
        <Card style={{ textAlign: "center", padding: 32, marginBottom: 16 }}>
          <i className="fas fa-credit-card" style={{ fontSize: 36, color: G.border, marginBottom: 12, display: "block" }}></i>
          <div style={{ color: G.muted, marginBottom: 4 }}>No card saved</div>
          <div style={{ fontSize: 13, color: G.light }}>Add a card for one-tap transfers</div>
        </Card>
      )}

      {!card && !showAdd && (
        <Btn onClick={setupAdd} full><i className="fas fa-plus"></i> Add New Card</Btn>
      )}

      {showAdd && clientSecret && (
        <Card style={{ border: \`2px solid \${G.green}33\` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.green, marginBottom: 16 }}><i className="fas fa-lock"></i> Add Card Securely</div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CardSetupForm
              onSuccess={() => { setShowAdd(false); api.getCard().then(d => setCard(d.card)); }}
              onCancel={() => setShowAdd(false)}
            />
          </Elements>
        </Card>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: G.light, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <i className="fas fa-lock"></i> Cards are stored securely by Stripe. We never see your card number.
      </div>
    </div>
  );
}

`;

content = content.replace(
  "// ── ACCOUNT ────────────────────────────────────────────────────────────────────",
  manageCardsComponent + "// ── ACCOUNT ────────────────────────────────────────────────────────────────────"
);

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
