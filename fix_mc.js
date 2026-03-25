const fs = require('fs');
let content = fs.readFileSync('src/App.js', 'utf8');

const manageCards = `
function ManageCards({ user, onBack }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [cardName, setCardName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCard().then(d => setCard(d.card)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const removeCard = async () => {
    if (!window.confirm("Remove this card?")) return;
    await api.deleteCard().catch(() => {});
    setCard(null);
  };

  const addCard = async () => {
    setSaving(true);
    try {
      const d = await api.setupCard();
      const url = "https://checkout.stripe.com/c/pay/" + d.client_secret;
      window.open(url, "_blank");
      setSaving(false);
      setShowAdd(false);
    } catch(e) { setSaving(false); alert(e.message); }
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
      {!card && <Btn onClick={addCard} disabled={saving} full><i className="fas fa-plus"></i> {saving ? "Opening Stripe..." : "Add New Card"}</Btn>}
      <div style={{ marginTop: 16, fontSize: 12, color: G.light, textAlign: "center" }}>
        <i className="fas fa-shield-alt"></i> Cards stored securely by Stripe
      </div>
    </div>
  );
}

`;

content = content.replace("// ── ACCOUNT ────────────────────────────────────────────────────────────────", manageCards + "// ── ACCOUNT ────────────────────────────────────────────────────────────────");
fs.writeFileSync('src/App.js', content, 'utf8');
console.log('Done - ManageCards added at line:', content.split('\n').findIndex(l => l.includes('function ManageCards')) + 1);
