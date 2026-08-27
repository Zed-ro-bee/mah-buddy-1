"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";

type Theme="System"|"Light"|"Dark";
type Difficulty="Easy"|"Normal"|"Hard";
type Prefs={theme:Theme;voice:boolean;autoSpeak:boolean;memory:boolean;notifications:boolean;reducedMotion:boolean;difficulty:Difficulty;questions:string;enterToSend:boolean};
const KEY="mah-buddy-prefs";
const defaults:Prefs={theme:"System",voice:true,autoSpeak:false,memory:true,notifications:true,reducedMotion:false,difficulty:"Normal",questions:"10",enterToSend:true};
function supabaseClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?createClient(url,key):null}
function Logo({size=36}:{size?:number}){return <img src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy"/>}
function SpeakerIcon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M18.5 7a7.5 7.5 0 0 1 0 10"/></svg>}
function Toggle({value,onChange,label}:{value:boolean;onChange:(v:boolean)=>void;label:string}){return <button type="button" className={value?"switch on":"switch"} aria-pressed={value} aria-label={label} onClick={()=>onChange(!value)}><span className="switch-track"><i className="switch-thumb"><b>{value?"✓":""}</b></i></span></button>}
function SettingRow({title,description,value,onChange,icon}:{title:string;description:string;value:boolean;onChange:(v:boolean)=>void;icon?:React.ReactNode}){return <div className="setting-row">{icon&&<div className="row-icon" aria-hidden="true">{icon}</div>}<div className="row-copy"><strong>{title}</strong><span>{description}</span></div><Toggle value={value} onChange={onChange} label={`${title}: ${value?"on":"off"}`}/></div>}
function setTheme(theme:Theme){const value=theme.toLowerCase();if(value==="dark"||value==="light"){localStorage.setItem("mb-theme",theme);document.documentElement.dataset.theme=value;document.documentElement.dataset.mbTheme=value}else{const dark=window.matchMedia?.("(prefers-color-scheme: dark)").matches;localStorage.setItem("mb-theme",dark?"Dark":"Light");document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.dataset.mbTheme=dark?"dark":"light"}}

export default function SettingsPage(){
 const[prefs,setPrefs]=useState<Prefs>(defaults);const[customQuestions,setCustomQuestions]=useState(25);const[saved,setSaved]=useState(false);const[signingOut,setSigningOut]=useState(false);
 useEffect(()=>{try{const stored=localStorage.getItem(KEY);if(stored){const raw=JSON.parse(stored) as Partial<Prefs> & {difficulty?:string};const migratedDifficulty:Difficulty=raw.difficulty==="Easy"||raw.difficulty==="Hard"?raw.difficulty:raw.difficulty==="Normal"||raw.difficulty==="Medium"?"Normal":"Normal";const next={...defaults,...raw,difficulty:migratedDifficulty};setPrefs(next);if(next.questions!=="Custom")setCustomQuestions(Math.max(1,Number(next.questions)||25));setTheme(next.theme)}}catch{}},[]);
 function update(patch:Partial<Prefs>){const next={...prefs,...patch,difficulty:patch.difficulty||prefs.difficulty};setPrefs(next);localStorage.setItem(KEY,JSON.stringify(next));setTheme(next.theme);localStorage.setItem("mb-voice",String(next.voice));localStorage.setItem("mb-auto-speak",String(next.autoSpeak));localStorage.setItem("mb-enter",String(next.enterToSend));window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));setSaved(true);window.setTimeout(()=>setSaved(false),900)}
 function clearHistory(){localStorage.removeItem("mah-buddy-history");localStorage.removeItem("mah-buddy-chat");localStorage.removeItem("mah-buddy-chats");window.dispatchEvent(new CustomEvent("mah-buddy-chat-cleared"));setSaved(true);window.setTimeout(()=>setSaved(false),900)}
 async function signOut(){
   if(signingOut)return;
   setSigningOut(true);
   try{
     const client=supabaseClient();
     if(client){
       const {error}=await client.auth.signOut({scope:"global"});
       if(error) console.error("Mah Buddy sign-out error:",error);
     }
     // Remove Supabase's persisted browser session so a refresh cannot restore the old account.
     Object.keys(localStorage).filter(key=>key.startsWith("sb-")&&key.includes("auth-token")).forEach(key=>localStorage.removeItem(key));
     sessionStorage.clear();
     window.dispatchEvent(new CustomEvent("mah-buddy-signed-out"));
     // The auth gate owns the sign-in/sign-up screen. A hard navigation forces it
     // to re-check the now-cleared session instead of leaving the settings UI mounted.
     window.location.replace("/?auth=signin");
   }catch(error){
     console.error("Mah Buddy sign-out error:",error);
     window.location.replace("/?auth=signin");
   }
 }
 return <main className="settings-app"><header className="settings-header"><a href="/" className="icon-back" aria-label="Back">←</a><div className="header-title"><Logo size={30}/><div><strong>Settings</strong><span>Mah Buddy</span></div></div><span className="saved">{saved?"Saved ✓":""}</span></header><div className="settings-content">
 <section className="settings-hero"><div className="hero-orb"><Logo size={48}/></div><div><span className="eyebrow">PERSONAL CONTROL</span><h1>Make it <em>yours.</em></h1><p>Fine-tune Mah Buddy so every study session feels natural to you.</p></div></section>
 <section className="panel"><div className="panel-heading"><div><span>APPEARANCE</span><h2>Look & feel</h2></div><b>01</b></div><div className="theme-grid">{(["Light","Dark","System"] as Theme[]).map(theme=><button key={theme} type="button" className={prefs.theme===theme?"theme-card active":"theme-card"} onClick={()=>update({theme})}><span className={`theme-preview ${theme.toLowerCase()}`}><i/></span><b>{theme}</b><small>{theme==="System"?"Follow device":theme==="Dark"?"Easy on the eyes":"Bright & clean"}</small></button>)}</div></section>
 <section className="panel"><div className="panel-heading"><div><span>VOICE</span><h2>Conversation</h2></div><b>02</b></div><SettingRow title="Voice input" description="Use your microphone in chat." value={prefs.voice} onChange={voice=>update({voice})} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>}/><SettingRow title="Text-to-speech" description="Make Mah Buddy's written answers audible." value={prefs.autoSpeak} onChange={autoSpeak=>update({autoSpeak,voice:autoSpeak||prefs.voice})} icon={<SpeakerIcon/>}/><div className="inline-note"><span>Voice language</span><b>British English</b></div></section>
 <section className="panel"><div className="panel-heading"><div><span>STUDY</span><h2>Learning defaults</h2></div><b>03</b></div><div className="field-block"><label>Difficulty</label><div className="seg">{(["Easy","Normal","Hard"] as Difficulty[]).map(value=><button key={value} type="button" className={prefs.difficulty===value?"selected":""} onClick={()=>update({difficulty:value})}>{value}</button>)}</div></div><div className="field-block"><label>Questions per session</label><div className="seg">{["5","10","20","Custom"].map(value=><button key={value} type="button" className={prefs.questions===value?"selected":""} onClick={()=>{if(value==="Custom")setCustomQuestions(customQuestions||25);update({questions:value})}}>{value}</button>)}</div>{prefs.questions==="Custom"&&<div className="custom-wrap"><input type="number" min="1" max="100" value={customQuestions} onChange={e=>{const number=Math.max(1,Math.min(100,Number(e.target.value)||1));setCustomQuestions(number);update({questions:String(number)})}}/><span>questions</span></div>}</div></section>
 <section className="panel"><div className="panel-heading"><div><span>BEHAVIOUR</span><h2>How Mah Buddy works</h2></div><b>04</b></div><SettingRow title="Enter to send" description="Send messages with the Enter key." value={prefs.enterToSend} onChange={enterToSend=>update({enterToSend})}/><SettingRow title="Memory" description="Use your saved study preferences." value={prefs.memory} onChange={memory=>update({memory})}/><SettingRow title="Notifications" description="Receive helpful study reminders." value={prefs.notifications} onChange={notifications=>update({notifications})}/><SettingRow title="Reduced motion" description="Use gentler animations throughout the app." value={prefs.reducedMotion} onChange={reducedMotion=>update({reducedMotion})}/></section>
 <section className="panel danger-panel"><div className="panel-heading"><div><span>DATA</span><h2>Your data</h2></div></div><button type="button" className="data-action" onClick={clearHistory}><div><strong>Clear chat history</strong><span>Remove conversations stored on this device.</span></div><b>Clear</b></button></section>
 <a href="/profile" className="profile-card-link"><span className="profile-avatar"><Logo size={26}/></span><div><strong>Profile</strong><small>Personal details & learning goals</small></div><b>→</b></a><button type="button" className="signout" onClick={signOut} disabled={signingOut}>{signingOut?"Signing out…":"Sign out"}</button>
 </div></main>
}
