import { useEffect, useState } from "react";

const G = { green: "#0b5e35", greenDark: "#093d28", greenMid: "#1a7a4a", greenLight: "#f0faf5", acc: "#f5a623", bg: "#f5f0e8", white: "#fff", border: "#e8e3d8", text: "#111", muted: "#666", light: "#999", font: "'DM Sans', sans-serif" };

export default function Receipt({ transfer, onClose, onSendAnother }) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(transfer?.id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: "TemboSwift Transfer", text: `I just sent $${transfer?.amount_usd} to Kenya via TemboSwift! KES ${parseFloat(transfer?.amount_kes || 0).toLocaleString()} on its way.` });
    }
  };

  if (!transfer) return null;

  return (
    <div style={{ fontFamily: G.font, padding: "0 0 40px" }}>
      {/* Success header */}
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div style={{ width: 80, height: 80, background: G.greenLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `3px solid ${G.green}` }}>
          <i className="fas fa-check" style={{ fontSize: 36, color: G.green }}></i>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Transfer Successful</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: G.text, marginBottom: 4 }}>
          KES {parseFloat(transfer.amount_kes || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: 15, color: G.muted }}>sent to {transfer.recipient_name || "Recipient"}</div>
      </div>

      {/* Receipt card */}
      <div style={{ background: G.white, borderRadius: 20, border: `1px solid ${G.border}`, overflow: "hidden", marginBottom: 16 }}>
        {/* Card header */}
        <div style={{ background: `linear-gradient(135deg, ${G.greenDark}, ${G.greenMid})`, padding: "20px 20px 16px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>TRANSACTION ID</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>#{transfer.id?.toString().slice(-8).toUpperCase() || "N/A"}</div>
            </div>
            <button onClick={copyId} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <i className={`fas fa-${copied ? "check" : "copy"}`}></i> {copied ? "Copied!" : "Copy ID"}
            </button>
          </div>
        </div>

        {/* Receipt details */}
        <div style={{ padding: "16px 20px" }}>
          {[
            { label: "You sent", value: `$${parseFloat(transfer.amount_usd || 0).toFixed(2)} USD`, icon: "fa-dollar-sign" },
            { label: "Recipient gets", value: `KES ${parseFloat(transfer.amount_kes || 0).toLocaleString()}`, icon: "fa-coins", highlight: true },
            { label: "Exchange rate", value: `1 USD = ${parseFloat(transfer.exchange_rate || transfer.client_rate || 129).toFixed(2)} KES`, icon: "fa-chart-line" },
            { label: "Transfer fee", value: "Free ✓", icon: "fa-tag" },
            { label: "Recipient", value: transfer.recipient_name || "—", icon: "fa-user" },
            { label: "Phone", value: transfer.recipient_phone || "—", icon: "fa-mobile-alt" },
            { label: "Delivery method", value: "M-Pesa", icon: "fa-wallet" },
            { label: "Status", value: transfer.status || "Processing", icon: "fa-info-circle", status: true },
            { label: "Date", value: new Date(transfer.created_at || Date.now()).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }), icon: "fa-calendar" },
          ].map(({ label, value, icon, highlight, status }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${G.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: G.greenLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fas ${icon}`} style={{ fontSize: 13, color: G.green }}></i>
                </div>
                <span style={{ fontSize: 13, color: G.muted }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: highlight ? G.green : status ? (transfer.status === "delivered" ? G.green : transfer.status === "failed" ? "#dc2626" : "#d97706") : G.text }}>
                {status ? (
                  <span style={{ background: transfer.status === "delivered" ? G.greenLight : transfer.status === "failed" ? "#fef2f2" : "#fef3c7", color: transfer.status === "delivered" ? G.green : transfer.status === "failed" ? "#dc2626" : "#92400e", padding: "3px 10px", borderRadius: 100, fontSize: 12 }}>
                    <i className={`fas fa-${transfer.status === "delivered" ? "check-circle" : transfer.status === "failed" ? "times-circle" : "clock"}`} style={{ marginRight: 4 }}></i>
                    {value}
                  </span>
                ) : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated delivery */}
      <div style={{ background: G.greenLight, border: `1px solid ${G.green}22`, borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <i className="fas fa-bolt" style={{ color: G.green, fontSize: 20 }}></i>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: G.green }}>Estimated delivery: ~2 minutes</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Recipient will get an M-Pesa notification</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={share} style={{ flex: 1, background: G.white, border: `1px solid ${G.border}`, borderRadius: 100, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: G.text }}>
          <i className="fas fa-share-alt"></i> Share
        </button>
        <button onClick={onSendAnother} style={{ flex: 2, background: G.green, color: "#fff", border: "none", borderRadius: 100, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <i className="fas fa-paper-plane"></i> Send Another
        </button>
      </div>
      <button onClick={onClose} style={{ width: "100%", background: "transparent", border: `1px solid ${G.border}`, borderRadius: 100, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: G.font, color: G.muted }}>
        Back to Home
      </button>
    </div>
  );
}
