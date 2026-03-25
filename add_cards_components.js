const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

const manageCards = `
// ── MANAGE CARDS ───────────────────────────────────────────────────────────
function CardForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const d = await api.setupCard();
      // Open Stripe hosted setup page
      window.open("https://billing.stripe.com/p/login/test_00g00000000000", "_blank");
      setLoading(false);
      onSuccess();
    } catch (e) { setError(e.message); setLoading(false); }
  };

  return (
    <div style={{ fontFamily: G.font }}>
      {error && <div style={{ background: G.redLight, color: G.red, padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      <Input label="Cardholder Name" icon="fa-user" value={name} onChange={e => setName(e.target.value)} placeholder="Joseph Kamau" />
      <Input label="Card Number" icon="fa-credit-card" value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Expiry" icon="fa-calendar" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
        <Input label="CVC" icon="fa-lock" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" maxLength={4} type="password" />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} full><i className="fas fa-times"></i> Cancel</Btn>
        <Btn onClick={handleSubmit} disabled={loading} full>
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-lock"></i> Save Card</>}
        </Btn>
      </div>
    </div>
  );
}

function ManageCards({ user, onBack }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.getCard().then(d => setCard(d.card)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const removeCard = async () => {
    if (!window.confirm("Remove this card?")) return;
    await api.deleteCard().catch(() => {});
    setCard(null);
  };

  const brandColors = { visa: "#1a1f71", mastercard: "#eb001b", amex: "#007bc1", discover: "#ff6600" };
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
        <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <i className={brandIcons[card.brand] || "fas fa-credit-card"} style={{ color: "#fff", fontSize: 36 }}></i>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>DEFAULT</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: 4, marginBottom: 16 }}>•••• •••• •••• {card.last4}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>EXPIRES</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{card.exp_month}/{card.exp_year}</div>
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
        <Btn onClick={() => setShowAdd(true)} full><i className="fas fa-plus"></i> Add New Card</Btn>
      )}

      {showAdd && (
        <Card style={{ border: \`2px solid \${G.green}33\`, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.green, marginBottom: 16 }}><i className="fas fa-lock"></i> Add Card Securely via Stripe</div>
          <CardForm onSuccess={() => { setShowAdd(false); api.getCard().then(d => setCard(d.card)).catch(() => {}); }} onCancel={() => setShowAdd(false)} />
        </Card>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: G.light, textAlign: "center" }}>
        <i className="fas fa-shield-alt"></i> Cards stored securely by Stripe · We never see your card number
      </div>
    </div>
  );
}

`;

// Insert before Account component
content = content.replace(
  "// ── ACCOUNT ────────────────────────────────────────────────────────────────────",
  manageCards + "// ── ACCOUNT ────────────────────────────────────────────────────────────────────"
);

fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done');
