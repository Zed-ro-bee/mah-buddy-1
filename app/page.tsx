"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AuthGate from "../components/auth-gate";

type Message={role:"user"|"assistant";content:string;attachment?:{name:string;type:string;data:string}};
type Chat={id:string;title:string;messages:Message[];updatedAt:number};
type Mode="chat"|"conversation"|"explain"|"flashcards"|"quiz";
type Screen="chat"|"history"|"tools"|"voice"|"profile"|"settings";
const modes=[{id:"chat" as Mode,label:"New chat",icon:"＋",prompt:""},{id:"conversation" as Mode,label:"Conversation",icon:"◉",prompt:""},{id:"explain" as Mode,label:"Explain",icon:"✦",prompt:"Explain this topic simply, step by step, with an example: "},{id:"flashcards" as Mode,label:"Flashcards",icon:"▤",prompt:"Turn this topic into 5 useful study flashcards with questions and answers: "},{id:"quiz" as Mode,label:"Quiz me",icon:"✓",prompt:"Quiz me on this topic. Ask one question at a time and wait for my answer before continuing: "}];
const starter=():Message[]=>[{role:"assistant",content:"Hey! I'm Mah Buddy 👋\nWhat are we learning today?"}];

export default function Home(){return <AuthGate><MahBuddyChat/></AuthGate>}
function MahBuddyChat(){
 const [chats,setChats]=useState<Chat[]>([]),[chatId,setChatId]=useState(""),[input,setInput]=useState(""),[loading,setLoading]=useState(false),[listening,setListening]=useState(false),[mode,setMode]=useState<Mode>("chat"),[voiceOn,setVoiceOn]=useState(true),[speaking,setSpeaking]=useState(false),[search,setSearch]=useState(""),[drawer,setDrawer]=useState(false),[screen,setScreen]=useState<Screen>("chat"),[dark,setDark]=useState(false),[memory,setMemory]=useState(true),[instructions,setInstructions]=useState(""),[attachment,setAttachment]=useState<Message["attachment"]>();
 const 
recognitionRef=useRef<any>(null),
audioRef=useRef<HTMLAudioElement|null>(null),
audioUrlRef=useRef<string|null>(null),
fileRef=useRef<HTMLInputElement|null>(null),
chatEndRef=useRef<HTMLDivElement|null>(null);
 const active=chats.find(c=>c.id===chatId)||chats[0],messages=active?.messages||starter();
 useEffect(()=>{try{const saved=localStorage.getItem("mah-buddy-chats"),prefs=JSON.parse(localStorage.getItem("mah-buddy-prefs")||"{}");const loaded:Chat[]=saved?JSON.parse(saved):[];if(loaded.length){setChats(loaded);setChatId(loaded[0].id)}else{const c={id:crypto.randomUUID(),title:"New chat",messages:starter(),updatedAt:Date.now()};setChats([c]);setChatId(c.id)}setDark(!!prefs.dark);setMemory(prefs.memory!==false);setInstructions(prefs.instructions||"")}catch{const c={id:Date.now().toString(),title:"New chat",messages:starter(),updatedAt:Date.now()};setChats([c]);setChatId(c.id)}},[]);
 useEffect(()=>{if(chats.length)localStorage.setItem("mah-buddy-chats",JSON.stringify(chats))},[chats]);
 useEffect(()=>{localStorage.setItem("mah-buddy-prefs",JSON.stringify({dark,memory,instructions}))},[dark,memory,instructions]);
 function stopSpeaking(){window.speechSynthesis?.cancel();if(audioRef.current){audioRef.current.pause();audioRef.current.src="";audioRef.current=null}if(audioUrlRef.current){URL.revokeObjectURL(audioUrlRef.current);audioUrlRef.current=null}setSpeaking(false)}
 function clean(text:string){return text.replace(/\p{Extended_Pictographic}/gu,"").replace(/[*_`#~>]+/g," ").replace(/\s+/g," ").trim()}
 async function speak(text:string){if(!voiceOn)return;const t=clean(text);if(!t)return;stopSpeaking();setSpeaking(true);try{const r=await fetch("/api/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t})});if(!r.ok)throw new Error();const u=URL.createObjectURL(await r.blob());audioUrlRef.current=u;const a=new Audio(u);audioRef.current=a;a.onended=stopSpeaking;a.onerror=()=>setSpeaking(false);await a.play()}catch{setSpeaking(false);if("speechSynthesis" in window){const u=new SpeechSynthesisUtterance(t);u.lang="en-GB";u.rate=.95;window.speechSynthesis.speak(u)}}}
 function updateMessages(next:Message[]){setChats(cs=>cs.map(c=>c.id===chatId?{...c,messages:next,updatedAt:Date.now(),title:c.title==="New chat"&&next.find(m=>m.role==="user")?next.find(m=>m.role==="user")!.content.slice(0,38):c.title}:c))}
 async function sendMessage(e?:FormEvent,textOverride?:string){e?.preventDefault();const raw=(textOverride??input).trim();if((!raw&&!attachment)||loading)return;setInput("");const selected=modes.find(x=>x.id===mode),prompt=mode==="chat"||mode==="conversation"?raw:`${selected?.prompt??""}${raw}`;const userMsg:Message={role:"user",content:raw||"Please analyze this file.",attachment},prior=messages;updateMessages([...prior,userMsg]);setAttachment(undefined);setLoading(true);try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:prior.concat({role:"user",content:prompt,attachment:userMsg.attachment}),customInstructions:instructions,memory:memory?prior.filter(m=>m.role==="user").slice(-4).map(m=>m.content).join(" | "):""})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Mah Buddy could not respond.");const reply=data.text||"I’m here. What would you like to do?";updateMessages([...prior,userMsg,{role:"assistant",content:reply}]);speak(reply)}catch(err){const t=err instanceof Error?err.message:"I couldn't answer that right now.";updateMessages([...prior,userMsg,{role:"assistant",content:t}])}finally{setLoading(false)}}
 function voice(){setScreen("voice");if(mode!=="conversation")setMode("conversation");const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!SR){alert("Voice input is not supported by this browser.");return}if(listening){recognitionRef.current?.stop();return}const r=new SR();recognitionRef.current=r;r.lang="en-GB";r.interimResults=false;r.continuous=false;r.onstart=()=>setListening(true);r.onend=()=>{setListening(false);recognitionRef.current=null};r.onerror=()=>setListening(false);r.onresult=(ev:any)=>sendMessage(undefined,ev.results[0][0].transcript);r.start()}
 function newChat(){stopSpeaking();const c={id:crypto.randomUUID(),title:"New chat",messages:starter(),updatedAt:Date.now()};setChats(cs=>[c,...cs]);setChatId(c.id);setMode("chat");setScreen("chat");setInput("");setDrawer(false)}
 function openChat(id:string){stopSpeaking();setChatId(id);setMode("chat");setScreen("chat");setDrawer(false)}
 function deleteChat(id:string){setChats(cs=>{const rest=cs.filter(c=>c.id!==id);if(!rest.length){const c={id:crypto.randomUUID(),title:"New chat",messages:starter(),updatedAt:Date.now()};setChatId(c.id);return[c]}if(id===chatId)setChatId(rest[0].id);return rest})}
 function exportChat(){if(!active)return;const text=active.messages.map(m=>`${m.role==="assistant"?"Mah Buddy":"You"}: ${m.content}`).join("\n\n");const blob=new Blob([text],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`mah-buddy-chat.txt`;a.click();URL.revokeObjectURL(a.href)}
 function chooseMode(next:Mode){stopSpeaking();setMode(next);setScreen(next==="conversation"?"voice":"chat");setDrawer(false);const item=modes.find(x=>x.id===next);setInput(next==="chat"||next==="conversation"?"":item?.prompt??"")}
  async function selectFile(file?:File){
  if(!file)return;

  if(file.size>6*1024*1024){
    alert("Please choose a file smaller than 6 MB.");
    return;
  }

  if(file.type.startsWith("image/")){
    const reader=new FileReader();
    reader.onload=()=>{
      setAttachment({
        name:file.name,
        type:file.type,
        data:String(reader.result)
      });
    };
    reader.readAsDataURL(file);
    return;
  }

  const isTextFile =
    file.type==="text/plain" ||
    file.type==="text/markdown" ||
    file.type==="text/csv" ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".csv");

  if(isTextFile){
    const text=await file.text().catch(()=> "");
    setAttachment({
      name:file.name,
      type:file.type,
      data:text.slice(0,50000)
    });
    return;
  }

  const reader=new FileReader();
  reader.onload=()=>{
    setAttachment({
      name:file.name,
      type:file.type,
      data:String(reader.result)
    });
  };
  reader.readAsDataURL(file);
}
 const filtered=useMemo(()=>chats.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())||c.messages.some(m=>m.content.toLowerCase().includes(search.toLowerCase()))),[chats,search]);
 function nav(s:Screen){setScreen(s);setDrawer(false);if(s!=="voice")stopSpeaking()}
useEffect(()=>{
  chatEndRef.current?.scrollIntoView({
    behavior:"smooth",
    block:"end",
  });
},[messages.length,loading]); useEffect(()=>()=>{stopSpeaking();recognitionRef.current?.stop()},[]);
 return <div className={`app ${dark?"dark":""}`}>
  <header className="top"><button className="menu" aria-label="Open menu" onClick={()=>setDrawer(true)}><span/><span/></button><button className="logo" onClick={()=>newChat()}><span className="mark">✦</span><span>Mah Buddy</span></button><button className="top-new" aria-label="New chat" onClick={newChat}>＋</button></header>
  {drawer&&<><button className="scrim" aria-label="Close menu" onClick={()=>setDrawer(false)}/><aside className="drawer"><div className="drawer-head"><div className="drawer-brand"><span className="mark">✦</span><b>Mah Buddy</b></div><button onClick={()=>setDrawer(false)}>×</button></div><button className="drawer-new" onClick={newChat}>＋ <span>New chat</span></button><div className="drawer-group"><small>YOUR SPACE</small><button onClick={()=>nav("history")}>◷ <span>Chat history</span></button><button onClick={()=>nav("tools")}>✦ <span>Mah Buddy Tools</span></button><button onClick={()=>nav("voice")}>◉ <span>Voice conversation</span></button></div><div className="drawer-group"><small>STUDY MODES</small>{modes.slice(2).map(x=><button key={x.id} onClick={()=>chooseMode(x.id)}>{x.icon} <span>{x.label}</span></button>)}</div><div className="drawer-bottom"><button onClick={()=>nav("profile")}>● <span>Profile</span></button><button onClick={()=>nav("settings")}>⚙ <span>Settings</span></button></div></aside></>}
  <main className="main">
   {screen==="chat"&&<><div className="chat-scroll"><div className="conversation"><div className="welcome"><div className="welcome-orb">✦</div><h1>{active?.messages.length===1?"What are we learning today?":active?.title||"Mah Buddy"}</h1><p>Your AI study companion, ready when you are.</p></div>{messages.map((m,i)=><div key={i} className={`msg ${m.role}`}><div className="avatar">{m.role==="assistant"?"✦":"You"}</div><div className="msg-body"><small>{m.role==="assistant"?"Mah Buddy":"You"}</small>{m.attachment&&<div className="attachment">{m.attachment.type.startsWith("image/")?<img src={m.attachment.data} alt={m.attachment.name}/>:<>📎 {m.attachment.name}</>}</div>}<div className="content">{m.content}</div>{m.role==="assistant"&&<div className="actions"><button onClick={()=>speak(m.content)} disabled={!voiceOn}>↻</button>{speaking&&i===messages.length-1&&<button onClick={stopSpeaking}>■</button>}</div>}</div></div>)}{loading&&<div className="msg"><div className="avatar">✦</div><div className="msg-body"><small>Mah Buddy</small><div className="dots"><i/><i/><i/></div></div></div>}
<div ref={chatEndRef} /></div></div><Composer input={input} setInput={setInput} send={sendMessage} fileRef={fileRef} selectFile={selectFile} attachment={attachment} setAttachment={setAttachment} voice={voice} listening={listening} loading={loading}/></>}
   {screen==="history"&&<Page title="Chat history" back={()=>nav("chat")}><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations"/></div>{filtered.map(c=><div className="history-card" key={c.id}><button onClick={()=>openChat(c.id)}><b>{c.title}</b><small>{c.messages.length-1} messages · {new Date(c.updatedAt).toLocaleDateString()}</small></button><button onClick={()=>deleteChat(c.id)}>×</button></div>)}</Page>}
   {screen==="tools"&&<Page title="Mah Buddy Tools" back={()=>nav("chat")}><div className="cards">{modes.slice(2).map(x=><button className="tool-card" key={x.id} onClick={()=>chooseMode(x.id)}><span>{x.icon}</span><b>{x.label}</b><small>Use Mah Buddy for focused study</small></button>)}<button className="tool-card" onClick={exportChat}><span>↗</span><b>Export chat</b><small>Save your current conversation</small></button></div></Page>}
   {screen==="voice"&&<Page title="Voice conversation" back={()=>nav("chat")}><div className="voice"><div className={`orb ${listening||speaking?"active":""}`}><span>✦</span></div><h2>{listening?"Listening…":speaking?"Mah Buddy is speaking…":"Talk to Mah Buddy"}</h2><p>{listening?"Speak naturally":"Use your voice for a hands-free conversation."}</p><button className={`voice-button ${listening?"on":""}`} onClick={voice}>{listening?"■ Stop":"🎙️ Start talking"}</button>{speaking&&<button className="stop" onClick={stopSpeaking}>Stop speaking</button>}</div></Page>}
   {screen==="profile"&&<Page title="Profile" back={()=>nav("chat")}><div className="profile-card"><div className="big-avatar">M</div><h2>Mah Buddy</h2><p>AI Study Companion</p></div><button className="setting-row" onClick={()=>nav("settings")}>⚙ <span><b>Settings</b><small>Manage your Mah Buddy experience</small></span><i>›</i></button></Page>}
   {screen==="settings"&&<Page title="Settings" back={()=>nav("chat")}><Setting label="Account" icon="●" detail="Profile and sign-in"/><Setting label="Appearance" icon="◐" detail={dark?"Dark mode":"Light mode"} toggle checked={dark} onChange={setDark}/><Setting label="Voice & Text-to-Speech" icon="◉" detail={voiceOn?"Voice enabled":"Voice disabled"} toggle checked={voiceOn} onChange={v=>{setVoiceOn(v);if(!v)stopSpeaking()}}/><Setting label="Notifications" icon="♢" detail="Coming soon"/><Setting label="Privacy & Security" icon="⌾" detail="Your chats stay on this device"/><Setting label="AI Preferences" icon="✦" detail="Custom instructions"/><Setting label="Memory" icon="◇" detail={memory?"Enabled":"Disabled"} toggle checked={memory} onChange={setMemory}/><Setting label="About Mah Buddy" icon="ⓘ" detail="Your AI study companion"/><button className="danger">Sign out</button><textarea className="instructions" value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="Custom AI instructions…"/></Page>}
  </main>
 </div>
}
function Composer(p:any){return <div className="composer-wrap"><form className="composer" onSubmit={p.send}>{p.attachment&&<div className="attach-preview">📎 {p.attachment.name}<button type="button" onClick={()=>p.setAttachment(undefined)}>×</button></div>}<textarea value={p.input} onChange={(e:any)=>p.setInput(e.target.value)} placeholder="Message Mah Buddy…" onKeyDown={(e:any)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit()}}}/><div className="composer-row"><input ref={p.fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv" onChange={(e:any)=>p.selectFile(e.target.files?.[0])}/><button type="button" onClick={()=>p.fileRef.current?.click()}>＋</button><button type="button" className={p.listening?"listening":""} onClick={p.voice} disabled={p.loading}>🎙</button><button className="send" disabled={p.loading||(!p.input.trim()&&!p.attachment)}>↑</button></div></form><small>Mah Buddy may make mistakes. Check important information.</small></div>}
function Page({title,back,children}:{title:string;back:()=>void;children:any}){return <section className="page"><div className="page-head"><button onClick={back}>‹</button><h1>{title}</h1></div><div className="page-body">{children}</div></section>}
function Setting({label,icon,detail,toggle,checked,onChange}:{label:string;icon:string;detail:string;toggle?:boolean;checked?:boolean;onChange?:(v:boolean)=>void}){return <div className="setting-row"><span className="setting-icon">{icon}</span><span><b>{label}</b><small>{detail}</small></span>{toggle?<input type="checkbox" checked={checked} onChange={e=>onChange?.(e.target.checked)}/>:<i>›</i>}</div>}

 const css=`*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#f4f1eb;color:#111827;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}

.app{
 min-height:100svh;
 background:#f4f1eb;
 color:#111827
}

.app.dark{
 background:#101827;
 color:#f7f5ef
}

/* PRESENTATION HEADER */

.top{
 height:76px;
 position:sticky;
 top:0;
 z-index:20;
 display:grid;
 grid-template-columns:52px 1fr 52px;
 align-items:center;
 padding:0 22px;
 background:#f4f1ebf2;
 backdrop-filter:blur(18px);
 border-bottom:1px solid #d8d5ce
}

.dark .top{
 background:#101827f2;
 border-color:#303949
}

.menu,.top-new,.logo,.drawer button,.page button,.setting-row,.history-card button,.tool-card,.voice-button,.stop,.danger{
 font:inherit;
 border:0;
 background:none;
 color:inherit;
 cursor:pointer
}

.menu,.top-new{
 width:44px;
 height:44px;
 display:grid;
 place-items:center;
 border-radius:50%;
 transition:.2s
}

.menu:hover,.top-new:hover{
 background:#ded9ce
}

.dark .menu:hover,.dark .top-new:hover{
 background:#293344
}

.menu{
 place-content:center;
 gap:5px
}

.menu span{
 display:block;
 width:20px;
 height:1.5px;
 background:currentColor
}

.logo{
 justify-self:center;
 display:flex;
 align-items:center;
 gap:11px;
 font-family:Georgia,"Times New Roman",serif;
 font-weight:700;
 font-size:22px;
 letter-spacing:-.03em
}

.mark{
 width:38px;
 height:38px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#18283d;
 color:#f5efe4;
 font-family:Georgia,serif;
 box-shadow:none
}

/* MAIN */

.main{
 min-height:calc(100svh - 76px);
 max-width:1180px;
 margin:auto
}

.chat-scroll{
 min-height:calc(100svh - 76px);
 overflow:auto;
 padding-bottom:170px
}

.conversation{
 padding:55px 30px 30px
}

/* PRESENTATION HERO */

.welcome{
 position:relative;
 min-height:390px;
 display:flex;
 flex-direction:column;
 justify-content:center;
 text-align:left;
 padding:45px clamp(25px,7vw,95px);
 margin-bottom:30px;
 overflow:hidden;
 background:#e6e1d8;
 border-bottom:1px solid #d1ccc3
}

.welcome:after{
 content:"";
 position:absolute;
 width:310px;
 height:310px;
 right:-75px;
 top:-90px;
 border-radius:50%;
 background:linear-gradient(135deg,#c8c4e9,#e9d7d9);
 opacity:.75
}

.welcome-orb{
 position:relative;
 z-index:1;
 width:58px;
 height:58px;
 margin:0 0 28px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#18283d;
 color:#fff;
 font-size:25px;
 box-shadow:none;
 animation:none
}

.welcome h1{
 position:relative;
 z-index:1;
 max-width:720px;
 font-family:Georgia,"Times New Roman",serif;
 font-size:clamp(38px,6vw,70px);
 line-height:.98;
 font-weight:500;
 letter-spacing:-.055em;
 margin:0 0 20px;
 color:#15253a
}

.welcome p{
 position:relative;
 z-index:1;
 max-width:470px;
 margin:0;
 font-size:14px;
 line-height:1.7;
 color:#5e625f
}

/* MESSAGES */

.msg{
 display:flex;
 gap:15px;
 max-width:820px;
 margin:30px auto
}

.msg.user{
 flex-direction:row-reverse
}

.avatar{
 width:38px;
 height:38px;
 flex:0 0 38px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#18283d;
 color:#fff;
 font-size:9px;
 font-weight:700
}

.user .avatar{
 background:#c7b9a6;
 color:#18283d
}

.msg-body{
 max-width:78%
}

.user .msg-body{
 text-align:right
}

.msg-body small{
 display:block;
 margin-bottom:8px;
 font-size:9px;
 text-transform:uppercase;
 letter-spacing:.14em;
 color:#777870
}

.content{
 white-space:pre-wrap;
 line-height:1.75;
 font-size:15px
}

.user .content{
 display:inline-block;
 text-align:left;
 background:#18283d;
 color:#fff;
 padding:14px 18px;
 border-radius:2px;
 box-shadow:none
}

.assistant .content{
 display:inline-block;
 background:#ebe7df;
 border:1px solid #d9d4ca;
 padding:14px 18px;
 border-radius:2px;
 box-shadow:none
}

.dark .assistant .content{
 background:#1b2738;
 border-color:#344052
}

/* ACTIONS */

.actions{
 display:flex;
 gap:4px;
 margin-top:7px
}

.actions button{
 border:0;
 background:none;
 color:inherit;
 opacity:.45;
 cursor:pointer;
 padding:5px
}

.actions button:hover{
 opacity:1
}

.dots{
 display:flex;
 gap:5px;
 padding:9px
}

.dots i{
 width:6px;
 height:6px;
 border-radius:50%;
 background:#626b77;
 animation:bounce 1s infinite
}

.dots i:nth-child(2){animation-delay:.15s}
.dots i:nth-child(3){animation-delay:.3s}

.attachment img{
 max-width:280px;
 max-height:200px;
 border-radius:2px;
 display:block
}

/* COMPOSER */

.composer-wrap{
 position:fixed;
 z-index:15;
 left:0;
 right:0;
 bottom:0;
 padding:15px max(18px,calc((100vw - 930px)/2));
 background:linear-gradient(transparent,#f4f1eb 30%);
 pointer-events:none
}

.dark .composer-wrap{
 background:linear-gradient(transparent,#101827 30%)
}

.composer,.composer-wrap small{
 pointer-events:auto
}

.composer{
 border:1px solid #cfcac0;
 background:#faf8f3;
 border-radius:2px;
 padding:9px;
 box-shadow:0 12px 35px #18283d12
}

.dark .composer{
 background:#172235;
 border-color:#374153
}

.composer:focus-within{
 border-color:#18283d;
 box-shadow:0 0 0 3px #18283d12
}

.composer textarea{
 display:block;
 width:100%;
 min-height:45px;
 max-height:130px;
 resize:none;
 border:0;
 outline:0;
 background:transparent;
 color:inherit;
 padding:9px;
 font:inherit
}

.composer-row{
 display:flex;
 justify-content:flex-end;
 gap:7px
}

.composer-row button{
 width:39px;
 height:39px;
 border:1px solid #d3cec5;
 border-radius:50%;
 background:#eeeae2;
 color:inherit;
 cursor:pointer
}

.composer-row .send{
 background:#18283d;
 border-color:#18283d;
 color:#fff;
 font-size:19px
}

.composer-row .send:disabled{
 opacity:.35
}

.composer-row .listening{
 outline:2px solid #9a8fbd
}

.composer-wrap>small{
 display:block;
 text-align:center;
 font-size:9px;
 color:#777870;
 margin-top:7px
}

.attach-preview{
 display:flex;
 justify-content:space-between;
 padding:8px;
 background:#e8e3da;
 font-size:12px
}

.attach-preview button{
 border:0;
 background:none;
 cursor:pointer
}

/* DRAWER */

.scrim{
 position:fixed;
 inset:0;
 z-index:40;
 background:#10182788;
 backdrop-filter:blur(2px)
}

.drawer{
 position:fixed;
 z-index:50;
 inset:0 auto 0 0;
 width:min(355px,90vw);
 background:#f4f1eb;
 padding:22px;
 display:flex;
 flex-direction:column;
 box-shadow:18px 0 45px #10182720;
 animation:slide .22s ease
}

.dark .drawer{
 background:#111c2b
}

.drawer-head{
 display:flex;
 align-items:center;
 justify-content:space-between;
 margin-bottom:28px
}

.drawer-brand{
 display:flex;
 align-items:center;
 gap:10px;
 font-family:Georgia,"Times New Roman",serif;
 font-size:19px
}

.drawer-head>button{
 font-size:26px;
 width:40px;
 height:40px
}

.drawer-new{
 display:flex!important;
 gap:10px;
 align-items:center;
 background:#18283d!important;
 color:#fff!important;
 padding:15px 16px!important;
 border-radius:2px!important;
 font-weight:700;
 margin-bottom:25px
}

.drawer-group{
 display:flex;
 flex-direction:column;
 gap:3px;
 margin-bottom:22px
}

.drawer-group small{
 font-size:9px;
 letter-spacing:.18em;
 color:#7b7c77;
 padding:8px 10px;
 font-weight:700
}

.drawer-group button,.drawer-bottom button{
 display:flex!important;
 align-items:center;
 gap:13px;
 padding:12px 10px!important;
 border-radius:2px!important;
 text-align:left
}

.drawer-group button:hover,.drawer-bottom button:hover{
 background:#e4dfd5!important
}

.dark .drawer-group button:hover,.dark .drawer-bottom button:hover{
 background:#263245!important
}

.drawer-bottom{
 margin-top:auto;
 border-top:1px solid #d6d1c8;
 padding-top:12px
}

.dark .drawer-bottom{
 border-color:#303b4b
}

/* PAGES */

.page{
 padding:40px 25px 70px
}

.page-head{
 display:flex;
 align-items:center;
 gap:12px;
 max-width:800px;
 margin:0 auto 35px;
 border-bottom:1px solid #d5d0c7;
 padding-bottom:22px
}

.dark .page-head{
 border-color:#303b4b
}

.page-head button{
 font-size:30px;
 width:42px;
 height:42px
}

.page-head h1{
 font-family:Georgia,"Times New Roman",serif;
 font-size:38px;
 font-weight:500;
 letter-spacing:-.045em;
 margin:0
}

.page-body{
 max-width:800px;
 margin:auto
}

.search{
 display:flex;
 align-items:center;
 gap:9px;
 background:#ebe7df;
 border:1px solid #d5d0c7;
 border-radius:2px;
 padding:13px 14px;
 margin-bottom:15px
}

.dark .search{
 background:#1b2738;
 border-color:#354052
}

.search input{
 border:0;
 outline:0;
 background:none;
 color:inherit;
 width:100%;
 font:inherit
}

.history-card{
 display:flex;
 align-items:center;
 gap:8px;
 padding:17px 5px;
 border-bottom:1px solid #d9d4ca
}

.dark .history-card{
 border-color:#303b4b
}

.history-card button:first-child{
 flex:1;
 text-align:left
}

.history-card b,.history-card small{
 display:block
}

.history-card b{
 font-family:Georgia,"Times New Roman",serif;
 font-size:17px;
 font-weight:500
}

.history-card small,.tool-card small{
 color:#777870;
 font-size:10px;
 margin-top:5px
}

.history-card button:last-child{
 font-size:20px;
 opacity:.45
}

/* AI TOOLS — PRESENTATION CARD STYLE */

.cards{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:14px
}

.tool-card{
 min-height:220px;
 display:flex;
 flex-direction:column;
 justify-content:space-between;
 text-align:left;
 padding:22px;
 border-radius:2px;
 background:#e5e0d7;
 border:1px solid #d2ccc2;
 transition:.2s ease
}

.tool-card:hover{
 transform:translateY(-3px);
 background:#ded8ce
}

.dark .tool-card{
 background:#1b2738;
 border-color:#344052
}

.tool-card span{
 width:45px;
 height:45px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#18283d;
 color:#fff;
 font-size:18px
}

.tool-card b{
 font-family:Georgia,"Times New Roman",serif;
 font-size:25px;
 font-weight:500;
 margin-top:auto;
 margin-bottom:5px
}

/* VOICE */

.voice{
 min-height:650px;
 display:flex;
 flex-direction:column;
 align-items:center;
 justify-content:center;
 text-align:center;
 padding:55px 20px;
 background:#18283d;
 color:#f5efe4
}

.orb{
 width:205px;
 height:205px;
 margin:10px auto 35px;
 border-radius:50%;
 display:grid;
 place-items:center;
 font-size:70px;
 color:#18283d;
 background:#d9d2c7;
 box-shadow:0 0 0 15px #ffffff0b;
 animation:float 3s ease-in-out infinite
}

.orb.active{
 animation:pulse 1s infinite
}

.voice h2{
 margin:0 0 10px;
 font-family:Georgia,"Times New Roman",serif;
 font-size:42px;
 font-weight:500;
 letter-spacing:-.045em
}

.voice p{
 opacity:.65
}

.voice-button{
 margin-top:22px;
 background:#f4f1eb;
 color:#18283d;
 padding:14px 22px;
 border-radius:2px;
 font-weight:750
}

.voice-button.on{
 background:#c8bce4;
 color:#18283d
}

.stop{
 display:block;
 margin:10px auto;
 padding:9px 14px;
 border-radius:2px;
 background:#29384d;
 color:#fff
}

/* PROFILE */

.profile-card{
 text-align:center;
 padding:35px 0 25px;
 background:#18283d;
 color:#f5efe4;
 margin-bottom:30px
}

.big-avatar{
 margin:auto;
 width:90px;
 height:90px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#d8d0c5;
 color:#18283d;
 font-family:Georgia,serif;
 font-size:30px;
 font-weight:700
}

.profile-card p{
 opacity:.62
}

/* SETTINGS */

.setting-row{
 width:100%;
 display:flex;
 align-items:center;
 gap:14px;
 padding:17px 4px;
 border-bottom:1px solid #d8d3ca;
 text-align:left
}

.dark .setting-row{
 border-color:#303b4b
}

.setting-icon{
 width:40px;
 height:40px;
 border-radius:50%;
 display:grid;
 place-items:center;
 background:#18283d;
 color:#fff
}

.setting-row span:nth-child(2){
 flex:1
}

.setting-row b,.setting-row small{
 display:block
}

.setting-row b{
 font-family:Georgia,"Times New Roman",serif;
 font-size:16px;
 font-weight:500
}

.setting-row small{
 font-size:10px;
 color:#777870;
 margin-top:3px
}

.setting-row i{
 font-style:normal;
 font-size:20px;
 opacity:.35
}

.setting-row input{
 width:20px;
 height:20px;
 accent-color:#18283d
}

.danger{
 width:100%;
 padding:14px;
 margin-top:25px;
 border-radius:2px;
 background:#e7d6d1;
 color:#8b3935;
 font-weight:700
}

.instructions{
 width:100%;
 min-height:110px;
 margin-top:12px;
 border:1px solid #d3cec5;
 border-radius:2px;
 padding:12px;
 background:#faf8f3;
 color:inherit;
 resize:vertical;
 font:inherit;
 outline:none
}

.dark .instructions{
 background:#172235;
 border-color:#374153
}

@keyframes slide{
 from{transform:translateX(-100%)}
 to{transform:translateX(0)}
}

@keyframes float{
 50%{transform:translateY(-6px)}
}

@keyframes pulse{
 50%{transform:scale(1.05);box-shadow:0 0 0 25px #ffffff08}
}

@keyframes bounce{
 50%{transform:translateY(-4px)}
}

@media(max-width:760px){
 .cards{
  grid-template-columns:1fr
 }

 .tool-card{
  min-height:155px
 }

 .welcome{
  min-height:360px
 }
}

@media(max-width:480px){
 .top{
  padding:0 12px
 }

 .conversation{
  padding-left:12px;
  padding-right:12px
 }

 .welcome{
  padding:35px 20px
 }

 .welcome h1{
  font-size:38px
 }

 .msg-body{
  max-width:84%
 }

 .composer-wrap{
  padding-left:9px;
  padding-right:9px
 }

 .drawer{
  width:88vw
 }

 .page{
  padding-left:16px;
  padding-right:16px
 }

 .page-head h1{
  font-size:31px
 }

 .voice h2{
  font-size:34px
 }
}`;
if(typeof document!=="undefined"){const id="mah-buddy-mobile-style";if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}}
