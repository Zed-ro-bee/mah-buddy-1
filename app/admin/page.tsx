"use client";

import { useEffect, useState } from "react";

type Metrics = { users:number; conversations:number; messages:number; activeUsers:number; signups7d:number; conversations7d:number; messages7d:number };

export default function AdminDashboard(){
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/admin/metrics",{credentials:"include"}).then(async r=>{if(!r.ok) throw new Error((await r.json()).error||"Access denied"); return r.json()}).then(setMetrics).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
  if(loading) return <main style={{padding:32,fontFamily:"system-ui"}}>Loading Mah Buddy performance…</main>;
  if(error) return <main style={{padding:32,fontFamily:"system-ui"}}><h1>Private Admin Dashboard</h1><p>{error}</p></main>;
  const cards=[['Total users',metrics?.users],['Active users (7d)',metrics?.activeUsers],['New signups (7d)',metrics?.signups7d],['Conversations',metrics?.conversations],['Messages',metrics?.messages],['Messages (7d)',metrics?.messages7d]];
  return <main style={{minHeight:"100vh",padding:32,fontFamily:"system-ui",background:"#0e0d14",color:"white"}}><div style={{maxWidth:1100,margin:"0 auto"}}><h1>Mah Buddy Performance</h1><p style={{opacity:.7}}>Private administrator dashboard</p><section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginTop:28}}>{cards.map(([label,value])=><div key={String(label)} style={{padding:20,borderRadius:16,background:"#191722",border:"1px solid #2a2735"}}><div style={{opacity:.65,fontSize:14}}>{label}</div><strong style={{fontSize:30}}>{value??0}</strong></div>)}</section><section style={{marginTop:28,padding:20,borderRadius:16,background:"#191722",border:"1px solid #2a2735"}}><h2>Recent activity</h2><p>Conversations in the last 7 days: {metrics?.conversations7d??0}</p></section></div></main>
}
