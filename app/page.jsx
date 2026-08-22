"use client";
import { useEffect, useRef, useState } from "react";

const BRAND = "#5B52F5";
const SOFT = "#F7F6FB";
const LINE = "#E9E7F0";
const INK = "#17151F";
const MUTED = "#686579";

function Mark({ size = 38 }) {
  return <div style={{ width:size,height:size,borderRadius:size*.28,background:"linear-gradient(135deg,#7A72FF,#5B52F5)",display:"grid",placeItems:"center",flexShrink:0 }}>
    <svg width={size*.62} height={size*.62} viewBox="0 0 100 100" fill="none">
      <path d="M13 80C13 45 15 20 33 20c15 0 13 17 17 26 4-9 2-26 17-26 18 0 20 25 20 60" stroke="white" strokeWidth="12.5" strokeLinecap="round"/>
      <path d="M50 47c-3.5-6.5-11-8-11-1.5C39 51.5 50 59 50 59s11-7.5 11-13.5c0-6.5-7.5-5-11 1.5Z" fill="white"/>
      <path d="M44.5 51c2 2.5 9 2.5 11 0" stroke={BRAND} strokeWidth="2.6" strokeLinecap="round"/>
    </svg>
  </div>;
}

const suggestions=["Explain a difficult topic simply","Help me plan my study time","Quiz me on what I'm learning","Help me solve this problem"];

export default function MahBuddy(){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [sidebar,setSidebar]=useState(true);
  const [dark,setDark]=useState(false);
  const bottom=useRef(null);

  useEffect(()=>{try{const x=JSON.parse(localStorage.getItem("mah-buddy-chat")||"[]");if(Array.isArray(x))setMessages(x)}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("mah-buddy-chat",JSON.stringify(messages))}catch{};bottom.current?.scrollIntoView({behavior:"smooth"})},[messages,busy]);

  async function send(text=input){
    const value=String(text||"").trim(); if(!value||busy)return;
    setInput(""); setBusy(true);
    const next=[...messages,{role:"user",content:value}]; setMessages(next);
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next.slice(-30),customInstructions:"You are Mah Buddy. Be warm, natural, clear and useful. Answer the user's actual question directly. Do not use a fixed template unless it genuinely helps.",memory:"Use the current conversation as context."})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(data.error||data.details||"Mah Buddy could not respond.");
      setMessages(m=>[...m,{role:"assistant",content:data.text||"I’m here. What would you like help with?"}]);
    }catch(e){setMessages(m=>[...m,{role:"assistant",content:`I couldn't respond right now. ${e instanceof Error?e.message:"Please try again."}`}]);}
    finally{setBusy(false)}
  }

  function clear(){setMessages([]);try{localStorage.removeItem("mah-buddy-chat")}catch{}}

  const bg=dark?"#17151F":"#fff", panel=dark?"#211F2B":SOFT, text=dark?"#F5F3FA":INK, muted=dark?"#B8B4C7":MUTED, line=dark?"#383444":LINE;
  return <div style={{height:"100dvh",display:"flex",background:bg,color:text,fontFamily:"Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",overflow:"hidden"}}>
    {sidebar&&<aside style={{width:270,background:panel,borderRight:`1px solid ${line}`,display:"flex",flexDirection:"column",padding:16,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 4px 22px",fontWeight:800,fontSize:18}}><Mark size={34}/>Mah Buddy</div>
      <button onClick={()=>{clear();}} style={navStyle}>＋ New chat</button>
      <button style={navStyle}>⌕ Search chats</button>
      <button style={navStyle}>✦ AI Tools</button>
      <div style={{flex:1}}/>
      <button style={navStyle} onClick={()=>setDark(v=>!v)}>◐ {dark?"Light mode":"Dark mode"}</button>
      <button style={navStyle}>⚙ Settings</button>
      <div style={{marginTop:12,padding:"12px 10px",borderTop:`1px solid ${line}`,color:muted,fontSize:12}}>Mah Buddy AI</div>
    </aside>}

    <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
      <header style={{height:62,borderBottom:`1px solid ${line}`,display:"flex",alignItems:"center",padding:"0 18px",gap:12,flexShrink:0}}>
        <button onClick={()=>setSidebar(v=>!v)} style={iconButton}>{sidebar?"‹":"☰"}</button>
        <Mark size={30}/><b>Mah Buddy</b>
        <span style={{marginLeft:"auto",fontSize:12,color:"#1FA36B"}}>● Online</span>
      </header>

      <section style={{flex:1,overflowY:"auto",padding:"32px 20px 10px"}}>
        <div style={{maxWidth:760,margin:"0 auto"}}>
          {messages.length===0?<div style={{minHeight:"65vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
            <Mark size={66}/>
            <h1 style={{fontSize:30,margin:"18px 0 7px",letterSpacing:-.7}}>How can I help?</h1>
            <p style={{color:muted,maxWidth:500,lineHeight:1.6,margin:"0 0 28px"}}>I'm Mah Buddy. Ask me anything, learn something, solve a problem, or just start a conversation.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,width:"100%",maxWidth:560}}>{suggestions.map(x=><button key={x} onClick={()=>send(x)} style={{textAlign:"left",padding:15,border:`1px solid ${line}`,background:bg,color:text,borderRadius:14,cursor:"pointer"}}><b style={{fontSize:13.5}}>{x}</b><div style={{fontSize:12,color:muted,marginTop:4}}>Start with this</div></button>)}</div>
          </div>:messages.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:10,margin:"0 0 22px"}}>{m.role!=="user"&&<Mark size={29}/>}<div style={{maxWidth:"78%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",background:m.role==="user"?BRAND:panel,color:m.role==="user"?"#fff":text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div></div>)}
          {busy&&<div style={{display:"flex",gap:10,alignItems:"flex-start"}}><Mark size={29}/><div style={{padding:"12px 16px",borderRadius:"4px 18px 18px 18px",background:panel,color:muted}}>Thinking…</div></div>}
          <div ref={bottom}/>
        </div>
      </section>

      <div style={{padding:"10px 20px 18px",flexShrink:0}}><div style={{maxWidth:760,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,border:`1px solid ${line}`,background:panel,borderRadius:24,padding:"8px 9px 8px 15px",boxShadow:"0 8px 25px rgba(20,15,40,.08)"}}>
          <button style={iconButton}>＋</button>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Message Mah Buddy…" rows={1} style={{flex:1,border:0,outline:0,resize:"none",background:"transparent",color:text,font: "inherit",padding:"8px 0",maxHeight:130}}/>
          <button onClick={()=>send()} disabled={!input.trim()||busy} style={{width:38,height:38,border:0,borderRadius:"50%",background:input.trim()&&!busy?BRAND:line,color:"white",cursor:input.trim()&&!busy?"pointer":"default",fontSize:18}}>↑</button>
        </div>
        <div style={{textAlign:"center",fontSize:11,color:muted,marginTop:8}}>Mah Buddy can make mistakes. Check important information.</div>
      </div></div>
    </main>
  </div>;
}

const navStyle={width:"100%",textAlign:"left",border:0,background:"transparent",padding:"11px 12px",borderRadius:10,cursor:"pointer",fontWeight:600,color:"inherit",marginBottom:3};
const iconButton={border:0,background:"transparent",cursor:"pointer",fontSize:18,padding:6,color:"inherit"};
