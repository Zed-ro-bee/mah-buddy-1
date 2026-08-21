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
body{background:#f5f3ff}

.app{
 min-height:100svh;
 background:
 radial-gradient(circle at 10% 0%,#e9e4ff 0,transparent 28%),
 radial-gradient(circle at 100% 100%,#fff0df 0,transparent 24%),
 #f8f7fc;
 color:#19172a;
 font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
 letter-spacing:-.01em
}

.app.dark{
 background:#10101a;
 color:#f7f5ff
}

.top{
 height:70px;
 position:sticky;
 top:0;
 z-index:20;
 display:grid;
 grid-template-columns:46px 1fr 46px;
 align-items:center;
 padding:0 14px;
 background:#ffffffd9;
 backdrop-filter:blur(22px);
 -webkit-backdrop-filter:blur(22px);
 border-bottom:1px solid #e8e4f2
}

.dark .top{
 background:#12121cdd;
 border-color:#29283a
}

.menu,.top-new,.logo,.drawer button,.page button,.setting-row,.history-card button,.tool-card,.voice-button,.stop,.danger{
 font:inherit;
 border:0;
 background:none;
 color:inherit;
 cursor:pointer
}

.menu,.top-new{
 width:42px;
 height:42px;
 border-radius:14px;
 display:grid;
 place-items:center;
 transition:.18s ease
}

.menu:hover,.top-new:hover{
 background:#eeebff;
 color:#5b52f5;
 transform:translateY(-1px)
}

.menu{
 place-content:center;
 gap:5px
}

.menu span{
 display:block;
 width:20px;
 height:2px;
 border-radius:4px;
 background:currentColor
}

.logo{
 justify-self:center;
 display:flex;
 align-items:center;
 gap:10px;
 font-weight:850;
 font-size:18px;
 letter-spacing:-.035em
}

.mark{
 width:36px;
 height:36px;
 border-radius:13px;
 display:grid;
 place-items:center;
 background:linear-gradient(135deg,#6258f5,#887eff);
 color:#fff;
 box-shadow:0 9px 25px #6258f538
}

.top-new{
 font-size:23px
}

.main{
 min-height:calc(100svh - 70px);
 max-width:1040px;
 margin:auto
}

.scrim{
 position:fixed;
 inset:0;
 z-index:40;
 background:#16132966;
 backdrop-filter:blur(3px)
}

.drawer{
 position:fixed;
 z-index:50;
 inset:0 auto 0 0;
 width:min(350px,89vw);
 background:#fff;
 padding:18px;
 display:flex;
 flex-direction:column;
 box-shadow:25px 0 60px #21184a20;
 animation:slide .22s ease
}

.dark .drawer{
 background:#181722
}

.drawer-head{
 display:flex;
 align-items:center;
 justify-content:space-between;
 margin-bottom:22px
}

.drawer-brand{
 display:flex;
 align-items:center;
 gap:10px;
 font-size:17px
}

.drawer-head>button{
 font-size:26px;
 width:42px;
 height:42px;
 border-radius:13px
}

.drawer-new{
 display:flex!important;
 gap:10px;
 align-items:center;
 background:#5b52f5!important;
 color:#fff!important;
 padding:14px 16px!important;
 border-radius:14px!important;
 font-weight:750;
 margin-bottom:20px;
 box-shadow:0 9px 22px #5b52f530
}

.dark .drawer-new{
 background:#7168ff!important;
 color:#fff!important
}

.drawer-group{
 display:flex;
 flex-direction:column;
 gap:4px;
 margin-bottom:17px
}

.drawer-group small{
 font-size:10px;
 letter-spacing:.14em;
 color:#77728e;
 padding:9px;
 font-weight:700
}

.drawer-group button,.drawer-bottom button{
 display:flex!important;
 align-items:center;
 gap:13px;
 padding:12px!important;
 border-radius:12px!important;
 text-align:left;
 transition:.16s ease
}

.drawer-group button:hover,.drawer-bottom button:hover{
 background:#efedff!important;
 color:#574ee7!important
}

.dark .drawer-group button:hover,.dark .drawer-bottom button:hover{
 background:#29283a!important;
 color:#a9a2ff!important
}

.drawer-bottom{
 margin-top:auto;
 border-top:1px solid #e6e2f0;
 padding-top:10px
}

.dark .drawer-bottom{
 border-color:#303044
}

.chat-scroll{
 min-height:calc(100svh - 70px);
 overflow:auto;
 padding-bottom:165px
}

.conversation{
 padding:48px 22px 24px
}

.welcome{
 text-align:center;
 padding:45px 10px 34px
}

.welcome-orb{
 margin:0 auto 20px;
 width:74px;
 height:74px;
 border-radius:25px;
 display:grid;
 place-items:center;
 font-size:34px;
 color:#fff;
 background:
 radial-gradient(circle at 30% 25%,#b4abff,#675bf1 58%,#4b43bd);
 box-shadow:0 16px 42px #675bf13b;
 animation:float 3.2s ease-in-out infinite
}

.welcome h1{
 font-size:clamp(28px,6vw,46px);
 margin:0 0 10px;
 letter-spacing:-.055em;
 font-weight:850;
 background:linear-gradient(90deg,#4f47d9,#756aff);
 -webkit-background-clip:text;
 background-clip:text;
 color:transparent
}

.welcome p{
 margin:0;
 color:#77738b;
 font-size:14px
}

.dark .welcome p{
 color:#a6a2b5
}

.msg{
 display:flex;
 gap:12px;
 max-width:790px;
 margin:28px auto;
 animation:fadeIn .25s ease
}

.msg.user{
 flex-direction:row-reverse
}

.avatar{
 width:36px;
 height:36px;
 flex:0 0 36px;
 border-radius:13px;
 display:grid;
 place-items:center;
 background:#e9e5ff;
 color:#554bd4;
 font-size:10px;
 font-weight:800
}

.user .avatar{
 background:#5b52f5;
 color:#fff
}

.dark .user .avatar{
 background:#756cff;
 color:#fff
}

.msg-body{
 max-width:79%
}

.user .msg-body{
 text-align:right
}

.msg-body small{
 display:block;
 font-size:10px;
 font-weight:700;
 color:#89849b;
 margin:0 0 7px
}

.content{
 white-space:pre-wrap;
 line-height:1.72;
 font-size:15px
}

.user .content{
 display:inline-block;
 text-align:left;
 background:#5b52f5;
 color:#fff;
 padding:12px 15px;
 border-radius:19px 19px 5px 19px;
 box-shadow:0 9px 24px #5b52f52b
}

.assistant .content{
 display:inline-block;
 background:#fff;
 border:1px solid #e7e3f0;
 padding:12px 15px;
 border-radius:19px 19px 19px 5px;
 box-shadow:0 7px 25px #332a6410
}

.dark .assistant .content{
 background:#1b1a27;
 border-color:#302f43
}

.actions{
 display:flex;
 gap:4px;
 margin-top:6px
}

.actions button{
 border:0;
 background:none;
 color:inherit;
 opacity:.45;
 cursor:pointer;
 padding:5px;
 border-radius:8px
}

.actions button:hover{
 opacity:1;
 background:#eeebff
}

.dots{
 display:flex;
 gap:5px;
 padding:9px
}

.dots i{
 width:7px;
 height:7px;
 border-radius:50%;
 background:#7770a4;
 animation:bounce 1s infinite
}

.dots i:nth-child(2){animation-delay:.15s}
.dots i:nth-child(3){animation-delay:.3s}

.attachment img{
 max-width:280px;
 max-height:200px;
 border-radius:15px;
 display:block
}

.composer-wrap{
 position:fixed;
 z-index:15;
 left:0;
 right:0;
 bottom:0;
 padding:12px max(13px,calc((100vw - 920px)/2));
 background:linear-gradient(transparent,#f8f7fc 27%);
 pointer-events:none
}

.dark .composer-wrap{
 background:linear-gradient(transparent,#10101a 27%)
}

.composer,.composer-wrap small{
 pointer-events:auto
}

.composer{
 border:1px solid #ddd8ed;
 background:#fff;
 border-radius:21px;
 padding:9px;
 box-shadow:0 15px 42px #2d235d14;
 backdrop-filter:blur(18px)
}

.dark .composer{
 background:#1a1925;
 border-color:#353449
}

.composer:focus-within{
 border-color:#8b82ff;
 box-shadow:0 0 0 4px #6d63f515,0 15px 42px #2d235d18
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
 border:0;
 border-radius:13px;
 background:#efedf5;
 color:inherit;
 cursor:pointer;
 transition:.17s ease
}

.composer-row button:hover{
 transform:translateY(-1px);
 background:#e7e3ff;
 color:#584ee5
}

.dark .composer-row button{
 background:#29283a
}

.composer-row .send{
 background:#5b52f5;
 color:#fff;
 font-size:20px;
 box-shadow:0 7px 17px #5b52f530
}

.composer-row .send:hover{
 background:#4941d8;
 color:#fff
}

.composer-row .send:disabled{
 opacity:.35
}

.composer-row .listening{
 outline:2px solid #7b70ff;
 background:#e6e2ff
}

.composer-wrap>small{
 display:block;
 text-align:center;
 font-size:9px;
 color:#858095;
 margin-top:6px
}

.attach-preview{
 display:flex;
 justify-content:space-between;
 padding:8px;
 border-radius:11px;
 background:#f0eef7;
 font-size:12px
}

.attach-preview button{
 border:0;
 background:none;
 cursor:pointer
}

.page{
 padding:22px 17px 65px
}

.page-head{
 display:flex;
 align-items:center;
 gap:9px;
 max-width:720px;
 margin:0 auto 25px
}

.page-head button{
 font-size:31px;
 width:43px;
 height:43px;
 border-radius:13px;
 transition:.17s ease
}

.page-head button:hover{
 background:#eeebff;
 color:#5b52f5
}

.page-head h1{
 font-size:27px;
 margin:0;
 letter-spacing:-.04em
}

.page-body{
 max-width:720px;
 margin:auto
}

.search{
 display:flex;
 align-items:center;
 gap:9px;
 background:#efedf5;
 border:1px solid transparent;
 border-radius:15px;
 padding:12px 14px;
 margin-bottom:14px
}

.search:focus-within{
 background:#fff;
 border-color:#d7d1ed;
 box-shadow:0 0 0 4px #6d63f510
}

.dark .search{
 background:#242331
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
 padding:15px 4px;
 border-bottom:1px solid #e7e3ee
}

.dark .history-card{
 border-color:#302f40
}

.history-card button:first-child{
 flex:1;
 text-align:left
}

.history-card b,.history-card small{
 display:block
}

.history-card b{
 font-size:14px
}

.history-card small,.tool-card small{
 color:#858095;
 font-size:11px;
 margin-top:4px
}

.history-card button:last-child{
 font-size:20px;
 opacity:.45
}

.cards{
 display:grid;
 gap:11px
}

.tool-card{
 display:grid;
 grid-template-columns:48px 1fr;
 grid-template-rows:1fr 1fr;
 text-align:left;
 padding:17px;
 border-radius:17px;
 background:#fff;
 border:1px solid #e5e1ee;
 box-shadow:0 7px 25px #332a6410;
 transition:.18s ease
}

.tool-card:hover{
 transform:translateY(-2px);
 border-color:#bdb5ee;
 box-shadow:0 13px 32px #332a6416
}

.dark .tool-card{
 background:#1b1a27;
 border-color:#302f43
}

.tool-card span{
 grid-row:1/3;
 width:40px;
 height:40px;
 border-radius:13px;
 display:grid;
 place-items:center;
 background:#ebe8ff;
 color:#574ed8;
 font-size:18px
}

.voice{
 text-align:center;
 padding:55px 15px
}

.orb{
 width:190px;
 height:190px;
 margin:10px auto 32px;
 border-radius:50%;
 display:grid;
 place-items:center;
 font-size:70px;
 color:#fff;
 background:
 radial-gradient(circle at 35% 30%,#bbb4ff,#685cf1 55%,#312875);
 box-shadow:0 0 0 15px #765cff10,0 0 75px #765cff42;
 animation:float 3s ease-in-out infinite
}

.orb.active{
 animation:pulse 1s infinite
}

.voice h2{
 margin:0 0 8px;
 font-size:27px;
 letter-spacing:-.04em
}

.voice p{
 color:#858095
}

.voice-button{
 margin-top:20px;
 background:#5b52f5;
 color:#fff;
 padding:13px 21px;
 border-radius:14px;
 font-weight:750;
 box-shadow:0 9px 22px #5b52f530
}

.voice-button:hover{
 transform:translateY(-1px)
}

.dark .voice-button{
 background:#756cff;
 color:#fff
}

.voice-button.on{
 background:#ff9f43;
 color:#fff
}

.stop{
 display:block;
 margin:10px auto;
 padding:9px 14px;
 border-radius:12px;
 background:#eeecf4
}

.profile-card{
 text-align:center;
 padding:28px 0 22px
}

.big-avatar{
 margin:auto;
 width:84px;
 height:84px;
 border-radius:29px;
 display:grid;
 place-items:center;
 background:#e7e2ff;
 color:#554bd3;
 font-size:29px;
 font-weight:850
}

.profile-card p{
 color:#858095
}

.setting-row{
 width:100%;
 display:flex;
 align-items:center;
 gap:13px;
 padding:16px 3px;
 border-bottom:1px solid #e7e3ee;
 text-align:left
}

.dark .setting-row{
 border-color:#302f40
}

.setting-icon{
 width:38px;
 height:38px;
 border-radius:12px;
 display:grid;
 place-items:center;
 background:#eeebff;
 color:#574ed8
}

.setting-row span:nth-child(2){
 flex:1
}

.setting-row b,.setting-row small{
 display:block
}

.setting-row small{
 font-size:11px;
 color:#858095;
 margin-top:3px
}

.setting-row i{
 font-style:normal;
 font-size:22px;
 opacity:.35
}

.setting-row input{
 width:20px;
 height:20px;
 accent-color:#5b52f5
}

.danger{
 width:100%;
 padding:14px;
 margin-top:20px;
 border-radius:14px;
 background:#ffe9e6;
 color:#c13d38;
 font-weight:700
}

.dark .danger{
 background:#3a2327;
 color:#ff9a9d
}

.instructions{
 width:100%;
 min-height:105px;
 margin-top:12px;
 border:1px solid #ddd8e8;
 border-radius:14px;
 padding:11px;
 background:#fff;
 color:inherit;
 resize:vertical;
 font:inherit;
 outline:none
}

.instructions:focus{
 border-color:#8177f5;
 box-shadow:0 0 0 4px #6d63f512
}

.dark .instructions{
 background:#1b1a27;
 border-color:#353449
}

@keyframes slide{
 from{transform:translateX(-100%)}
 to{transform:translateX(0)}
}

@keyframes fadeIn{
 from{opacity:0;transform:translateY(5px)}
 to{opacity:1;transform:translateY(0)}
}

@keyframes float{
 50%{transform:translateY(-7px)}
}

@keyframes pulse{
 50%{transform:scale(1.06);box-shadow:0 0 0 28px #765cff08,0 0 105px #765cff65}
}

@keyframes bounce{
 50%{transform:translateY(-4px)}
}

@media(min-width:761px){
 .top{
  max-width:1040px;
  margin:auto;
  border-left:1px solid #e8e4f2;
  border-right:1px solid #e8e4f2
 }

 .main{
  border-left:1px solid #ebe7f2;
  border-right:1px solid #ebe7f2
 }
}

@media(max-width:480px){
 .conversation{
  padding-left:14px;
  padding-right:14px
 }

 .welcome{
  padding-top:30px
 }

 .welcome h1{
  font-size:29px
 }

 .msg-body{
  max-width:84%
 }

 .composer-wrap{
  padding-left:9px;
  padding-right:9px
 }

 .drawer{
  width:87vw
 }
}

@media(prefers-reduced-motion:reduce){
 *,*::before,*::after{
  animation:none!important;
  transition:none!important
 }
}`;

if(typeof document!=="undefined"){const id="mah-buddy-mobile-style";if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}}
