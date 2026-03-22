import { useState, useEffect } from "react";
const API = "https://temboswift-backend.onrender.com/api";
const ADMIN_KEY = "temboswift_admin_2026";
const G = { bg:"#07090c",surface:"#0c1017",card:"#111820",border:"#1c2a35",green:"#00e676",greenG:"rgba(0,230,118,0.12)",blue:"#38bdf8",orange:"#fb923c",red:"#f87171",yellow:"#fbbf24",purple:"#c084fc",text:"#e2edf5",muted:"#4a6375",font:"'DM Sans',sans-serif",mono:"'JetBrains Mono',monospace" };
const STATUS_COLORS = { delivered:{bg:"rgba(0,230,118,0.1)",color:"#00e676"}, pending:{bg:"rgba(251,191,36,0.1)",color:"#fbbf24"}, processing:{bg:"rgba(251,191,36,0.1)",color:"#fbbf24"}, compliance_check:{bg:"rgba(56,189,248,0.1)",color:"#38bdf8"}, funded:{bg:"rgba(56,189,248,0.1)",color:"#38bdf8"}, failed:{bg:"rgba(248,113,113,0.1)",color:"#f87171"} };
function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ background:s.bg,color:s.color,fontSize:10,fontFamily:G.mono,padding:"3px 8px",borderRadius:4,whiteSpace:"nowrap",textTransform:"capitalize" }}>{status?.replace(/_/g," ")}</span>;
}
function StatCard({ label, value, sub, color="#00e676" }) {
  return (
    <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:"20px 24px" }}>
      <div style={{ fontSize:10,color:G.muted,fontFamily:G.mono,letterSpacing:"0.1em",marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:28,fontWeight:800,color,fontFamily:G.mono,letterSpacing:"-1px" }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:G.muted,fontFamily:G.mono,marginTop:4 }}>{sub}</div>}
    </div>
  );
}
function AdminLogin({ onLogin }) {
  const [key,setKey]=useState(""); const [error,setError]=useState("");
  const handleLogin = () => { if(key===ADMIN_KEY){onLogin();}else{setError("Invalid admin key");} };
  return (
    <div style={{ minHeight:"100vh",background:G.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:G.font }}>
      <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:16,padding:40,width:360 }}>
        <div style={{ fontSize:24,fontWeight:800,color:"#fff",marginBottom:4 }}>Admin Panel</div>
        <div style={{ fontSize:12,color:G.muted,fontFamily:G.mono,marginBottom:28 }}>TemboSwift Operations</div>
        {error && <div style={{ background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:G.red,fontFamily:G.mono,marginBottom:16 }}>⚠ {error}</div>}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,color:G.muted,fontFamily:G.mono,marginBottom:6 }}>ADMIN KEY</div>
          <input type="password" placeholder="Enter admin key" value={key} onChange={e=>setKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={{ width:"100%",background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"11px 14px",fontSize:14,color:G.text,fontFamily:G.font,outline:"none",boxSizing:"border-box" }} />
        </div>
        <button onClick={handleLogin} style={{ width:"100%",background:G.green,color:"#000",border:"none",borderRadius:8,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:G.font }}>Access Dashboard</button>
      </div>
    </div>
  );
}
function Overview({ stats, transfers }) {
  const recentTx = transfers.slice(0,8);
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:28 }}>
        <StatCard label="TOTAL VOLUME" value={`$${stats.totalVolume?.toLocaleString()||0}`} sub="All time USD sent" color="#00e676" />
        <StatCard label="TOTAL TRANSFERS" value={stats.totalTransfers||0} sub="All corridors" color="#38bdf8" />
        <StatCard label="DELIVERED" value={stats.delivered||0} sub="Successfully completed" color="#00e676" />
        <StatCard label="PENDING" value={stats.pending||0} sub="Awaiting processing" color="#fbbf24" />
        <StatCard label="FAILED" value={stats.failed||0} sub="Requires attention" color="#f87171" />
        <StatCard label="TOTAL USERS" value={stats.totalUsers||0} sub="Registered accounts" color="#c084fc" />
      </div>
      <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:24,overflowX:"auto" }}>
        <div style={{ fontSize:14,fontWeight:700,color:"#fff",marginBottom:20 }}>Recent Transfers</div>
        {recentTx.length===0 ? <div style={{ textAlign:"center",padding:32,color:G.muted,fontSize:13 }}>No transfers yet</div> : (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
            <thead><tr>{["ID","User","Recipient","USD","KES","Status","Date"].map(h=><th key={h} style={{ textAlign:"left",padding:"8px 12px",color:G.muted,fontFamily:G.mono,fontSize:10,borderBottom:`1px solid ${G.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{recentTx.map(tx=>(
              <tr key={tx.id} style={{ borderBottom:`1px solid ${G.border}` }}>
                <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{tx.id?.slice(0,8)}...</td>
                <td style={{ padding:"10px 12px",color:G.text }}>{tx.user_email||"—"}</td>
                <td style={{ padding:"10px 12px",color:G.text }}>{tx.recipient_name||"—"}</td>
                <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.text }}>${parseFloat(tx.amount_usd).toFixed(2)}</td>
                <td style={{ padding:"10px 12px",fontFamily:G.mono,color:"#00e676" }}>KES {parseFloat(tx.amount_kes).toLocaleString()}</td>
                <td style={{ padding:"10px 12px" }}><Badge status={tx.status} /></td>
                <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
function Transfers({ transfers }) {
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState("");
  const shown = transfers.filter(t=>filter==="all"||t.status===filter).filter(t=>!search||t.recipient_name?.toLowerCase().includes(search.toLowerCase())||t.id?.includes(search));
  return (
    <div>
      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1,minWidth:200,background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"9px 14px",fontSize:13,color:G.text,fontFamily:G.font,outline:"none" }} />
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {["all","delivered","pending","processing","failed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"7px 14px",border:`1px solid ${filter===f?"#00e676":G.border}`,background:filter===f?"rgba(0,230,118,0.12)":"transparent",color:filter===f?"#00e676":G.muted,borderRadius:6,cursor:"pointer",fontFamily:G.mono,fontSize:11,textTransform:"capitalize" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:24,overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
          <thead><tr>{["ID","Recipient","Phone","USD","KES","Fee","Status","Date"].map(h=><th key={h} style={{ textAlign:"left",padding:"8px 12px",color:G.muted,fontFamily:G.mono,fontSize:10,borderBottom:`1px solid ${G.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{shown.map(tx=>(
            <tr key={tx.id} style={{ borderBottom:`1px solid ${G.border}` }}>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{tx.id?.slice(0,8)}...</td>
              <td style={{ padding:"10px 12px",color:G.text }}>{tx.recipient_name}</td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{tx.recipient_phone}</td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.text }}>${parseFloat(tx.amount_usd).toFixed(2)}</td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:"#00e676" }}>KES {parseFloat(tx.amount_kes).toLocaleString()}</td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted }}>${parseFloat(tx.fee_usd).toFixed(2)}</td>
              <td style={{ padding:"10px 12px" }}><Badge status={tx.status} /></td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
        {shown.length===0 && <div style={{ textAlign:"center",padding:32,color:G.muted,fontSize:13 }}>No transfers found</div>}
      </div>
    </div>
  );
}
function Users({ users }) {
  const [search,setSearch]=useState("");
  const shown = users.filter(u=>!search||u.email?.toLowerCase().includes(search.toLowerCase())||u.full_name?.toLowerCase().includes(search.toLowerCase()));
  const kycColors = { approved:"#00e676",pending:"#fbbf24",submitted:"#38bdf8",rejected:"#f87171" };
  return (
    <div>
      <input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%",background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"9px 14px",fontSize:13,color:G.text,fontFamily:G.font,outline:"none",marginBottom:20,boxSizing:"border-box" }} />
      <div style={{ background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:24,overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
          <thead><tr>{["Name","Email","Phone","KYC","Joined"].map(h=><th key={h} style={{ textAlign:"left",padding:"8px 12px",color:G.muted,fontFamily:G.mono,fontSize:10,borderBottom:`1px solid ${G.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{shown.map(u=>(
            <tr key={u.id} style={{ borderBottom:`1px solid ${G.border}` }}>
              <td style={{ padding:"10px 12px",color:G.text,fontWeight:600 }}>{u.full_name}</td>
              <td style={{ padding:"10px 12px",color:G.muted,fontFamily:G.mono,fontSize:11 }}>{u.email}</td>
              <td style={{ padding:"10px 12px",color:G.muted,fontFamily:G.mono,fontSize:11 }}>{u.phone||"—"}</td>
              <td style={{ padding:"10px 12px" }}><span style={{ background:`${kycColors[u.kyc_status]}22`,color:kycColors[u.kyc_status],fontSize:10,fontFamily:G.mono,padding:"3px 8px",borderRadius:4,textTransform:"capitalize" }}>{u.kyc_status}</span></td>
              <td style={{ padding:"10px 12px",fontFamily:G.mono,color:G.muted,fontSize:11 }}>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
        {shown.length===0 && <div style={{ textAlign:"center",padding:32,color:G.muted,fontSize:13 }}>No users found</div>}
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  const [authed,setAuthed]=useState(false); const [tab,setTab]=useState("overview");
  const [transfers,setTransfers]=useState([]); const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true); const [lastRefresh,setLastRefresh]=useState(null);
  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { "x-admin-key": ADMIN_KEY };
      const [txRes,usersRes] = await Promise.all([
        fetch(`${API}/admin/transfers`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
      ]);
      const [txData,usersData] = await Promise.all([txRes.json(),usersRes.json()]);
      setTransfers(txData.transfers||[]); setUsers(usersData.users||[]);
    } catch(err) { console.error(err); }
    finally { setLoading(false); setLastRefresh(new Date()); }
  };
  useEffect(()=>{ if(authed) loadData(); },[authed]);
  const stats = { totalTransfers:transfers.length, totalVolume:transfers.reduce((a,t)=>a+parseFloat(t.amount_usd||0),0), delivered:transfers.filter(t=>t.status==="delivered").length, pending:transfers.filter(t=>["pending","processing","funded"].includes(t.status)).length, failed:transfers.filter(t=>t.status==="failed").length, totalUsers:users.length };
  const TABS = [{ id:"overview",label:"Overview",icon:"📊" },{ id:"transfers",label:"Transfers",icon:"💸" },{ id:"users",label:"Users",icon:"👥" }];
  if(!authed) return <AdminLogin onLogin={()=>setAuthed(true)} />;
  return (
    <div style={{ minHeight:"100vh",background:G.bg,color:G.text,fontFamily:G.font }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:20 }}>🐘</span>
          <div style={{ fontSize:16,fontWeight:800,color:"#fff" }}>TemboSwift <span style={{ color:G.muted,fontWeight:400,fontSize:13 }}>Admin</span></div>
          <div style={{ background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:4,padding:"2px 8px",fontSize:9,color:"#f87171",fontFamily:G.mono }}>INTERNAL</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          {lastRefresh && <div style={{ fontSize:10,color:G.muted,fontFamily:G.mono }}>Updated {lastRefresh.toLocaleTimeString()}</div>}
          <button onClick={loadData} style={{ background:"rgba(0,230,118,0.12)",border:"1px solid #00e676",color:"#00e676",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:G.mono }}>↻ Refresh</button>
          <button onClick={()=>setAuthed(false)} style={{ background:"transparent",border:`1px solid ${G.border}`,color:G.muted,borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:G.mono }}>Sign Out</button>
        </div>
      </div>
      <div style={{ background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"0 32px",display:"flex",gap:4 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 16px",border:"none",background:"transparent",color:tab===t.id?"#00e676":G.muted,fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",borderBottom:tab===t.id?"2px solid #00e676":"2px solid transparent",fontFamily:G.font }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div style={{ padding:32,maxWidth:1400,margin:"0 auto" }}>
        {loading ? <div style={{ textAlign:"center",padding:80,color:G.muted,fontFamily:G.mono }}>Loading data...</div> : (
          <>
            {tab==="overview" && <Overview stats={stats} transfers={transfers} />}
            {tab==="transfers" && <Transfers transfers={transfers} />}
            {tab==="users" && <Users users={users} />}
          </>
        )}
      </div>
    </div>
  );
}
