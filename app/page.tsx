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

if(typeof document!=="undefined"){const id="mah-buddy-mobile-style";if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}}
