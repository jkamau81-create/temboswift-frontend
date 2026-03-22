import { useState } from "react";
const API = "https://temboswift-backend.onrender.com/api";
const G = { bg:"#07090c",card:"#111820",border:"#1c2a35",green:"#00e676",greenG:"rgba(0,230,118,0.12)",text:"#e2edf5",muted:"#4a6375",font:"'DM Sans',sans-serif",mono:"'JetBrains Mono',monospace" };
export default function KYCVerify({ user, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const token = localStorage.getItem("ks_token");
  const startKYC = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/kyc/start`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.status === "approved") { onComplete(); return; }
      if (data.url) { window.open(data.url, "_blank"); setStarted(true); }
      else if (data.clientSecret) {
        window.open(`https://verify.stripe.com/start#${data.clientSecret}`, "_blank");
        setStarted(true);
      }
    } catch (err) { setError("Failed to start verification. Please try again."); }
    finally { setLoading(false); }
  };
  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/kyc/status`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.kyc_status === "approved") { onComplete(); }
      else { setError(`Status: ${data.kyc_status}. Please complete verification or wait for approval.`); }
    } catch (err) { setError("Failed to check status."); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth:480,margin:"0 auto",paddingTop:60,textAlign:"center",fontFamily:G.font }}>
      <div style={{ fontSize:64,marginBottom:24 }}>🪪</div>
      <div style={{ fontSize:22,fontWeight:800,color:"#fff",marginBottom:8 }}>Verify Your Identity</div>
      <div style={{ fontSize:14,color:G.muted,fontFamily:G.mono,marginBottom:32 }}>Required to send money · Takes 2 minutes</div>
      <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:28,marginBottom:20 }}>
        {[["📄","Government ID","Passport, Driver's License, or National ID"],["🤳","Selfie","Quick photo to match your ID"],["⚡","Instant","Most verifications complete in seconds"]].map(([icon,title,desc])=>(
          <div key={title} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${G.border}`,textAlign:"left" }}>
            <span style={{ fontSize:24,flexShrink:0 }}>{icon}</span>
            <div><div style={{ fontSize:13,fontWeight:600,color:"#fff" }}>{title}</div><div style={{ fontSize:11,color:G.muted,fontFamily:G.mono,marginTop:2 }}>{desc}</div></div>
          </div>
        ))}
      </div>
      {error && <div style={{ background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#f87171",fontFamily:G.mono,marginBottom:16 }}>⚠ {error}</div>}
      {!started ? (
        <button onClick={startKYC} disabled={loading} style={{ width:"100%",background:G.green,color:"#000",border:"none",borderRadius:8,padding:14,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:G.font,opacity:loading?0.7:1 }}>
          {loading ? "Starting..." : "Start Verification →"}
        </button>
      ) : (
        <div>
          <div style={{ background:"rgba(0,230,118,0.08)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:8,padding:"12px 14px",fontSize:12,color:G.green,fontFamily:G.mono,marginBottom:16 }}>
            ✓ Verification opened in a new tab. Complete it then click below.
          </div>
          <button onClick={checkStatus} disabled={loading} style={{ width:"100%",background:G.green,color:"#000",border:"none",borderRadius:8,padding:14,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:G.font,opacity:loading?0.7:1 }}>
            {loading ? "Checking..." : "I've Completed Verification ✓"}
          </button>
        </div>
      )}
      <div style={{ fontSize:11,color:G.muted,fontFamily:G.mono,marginTop:20 }}>Powered by Stripe Identity · Bank-grade security</div>
    </div>
  );
}
