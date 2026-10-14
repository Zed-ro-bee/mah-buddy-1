"use client";

import { useEffect, useState } from "react";
import type { ReactNode, CSSProperties } from "react";

type Difficulty = "Easy" | "Normal" | "Hard";
type Palette = "forest" | "ocean" | "violet" | "rose" | "amber" | "midnight";
const palettes: Record<Palette, {name:string;bg:string;surface:string;raised:string;accent:string;muted:string}> = {
  forest:{name:"Dark Forest",bg:"#141916",surface:"#1D2922",raised:"#263B30",accent:"#9BE8F4",muted:"#A0ACA3"},
  ocean:{name:"Deep Ocean",bg:"#101923",surface:"#182A39",raised:"#213D50",accent:"#71D8FF",muted:"#9CB5C6"},
  violet:{name:"Violet Night",bg:"#191523",surface:"#282038",raised:"#3B2D52",accent:"#C6A5FF",muted:"#B0A6C2"},
  rose:{name:"Rose Ember",bg:"#211719",surface:"#332225",raised:"#4A2E35",accent:"#FF9EBC",muted:"#C6A6AD"},
  amber:{name:"Amber Dusk",bg:"#211D14",surface:"#332B1D",raised:"#4A3B25",accent:"#FFD080",muted:"#C1B49A"},
  midnight:{name:"Midnight Blue",bg:"#111827",surface:"#1C273B",raised:"#293A56",accent:"#A5BFFF",muted:"#A5B0C5"}
};
type Prefs = {
  voice:boolean;autoSpeak:boolean;memory:boolean;notifications:boolean;reducedMotion:boolean;
  difficulty:Difficulty;questions:string;enterToSend:boolean;answerStyle:"Simple"|"Balanced"|"Detailed";
  voiceSpeed:string;dailyGoal:string;reminders:boolean;revision:boolean;palette:Palette;accent:string;
};
const KEY="mah-buddy-prefs";
const defaults:Prefs={voice:true,autoSpeak:false,memory:true,notifications:true,reducedMotion:false,difficulty:"Normal",questions:"10",enterToSend:true,answerStyle:"Balanced",voiceSpeed:"1",dailyGoal:"30",reminders:false,revision:true,palette:"forest",accent:palettes.forest.accent};
const muted="var(--mb-muted,#A0ACA3)";
const line="var(--mb-border-strong,#344B3C)";
const accent="var(--mb-accent,#9BE8F4)";
const control:CSSProperties={maxWidth:"48%",minWidth:112,padding:"10px 11px",border:"1px solid "+line,borderRadius:11,background:"var(--mb-ink-raised,#172019)",color:"#F0F4F0",fontSize:12};
function Toggle({value,onChange,label}:{value:boolean;onChange:(v:boolean)=>void;label:string}){
 return <button type="button" role="switch" aria-checked={value} aria-label={label} onClick={()=>onChange(!value)} style={{width:44,height:26,padding:3,border:0,borderRadius:99,background:value?accent:"#46534A",display:"flex",alignItems:"center",justifyContent:value?"flex-end":"flex-start",flexShrink:0,cursor:"pointer"}}><span style={{width:20,height:20,borderRadius:"50%",background:value?"#142126":"#D4DDD5",display:"grid",placeItems:"center",fontSize:11,color:"#142126"}}>{value?"✓":""}</span></button>;
}
function SettingRow({title,description,children}:{title:string;description:string;children:ReactNode}){
 return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,padding:"14px 0",borderBottom:"1px solid rgba(160,180,164,.13)"}}><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:650,color:"#F0F4F0"}}>{title}</div><div style={{fontSize:11,lineHeight:1.55,color:muted,marginTop:4}}>{description}</div></div>{children}</div>;
}
function Section({number,title,kicker,children}:{number:string;title:string;kicker:string;children:ReactNode}){
 return <section style={{padding:"17px 18px",marginBottom:12,border:"1px solid "+line,borderRadius:19,background:"var(--mb-surface,#1D2922)",boxShadow:"0 10px 28px rgba(0,0,0,.08)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:5}}><div><div style={{fontSize:9,letterSpacing:".16em",fontWeight:800,color:accent}}>{kicker}</div><h2 style={{fontSize:16,letterSpacing:"-.025em",margin:"6px 0 2px",fontWeight:680}}>{title}</h2></div><span style={{fontSize:10,color:"#718077"}}>{number}</span></div>{children}</section>;
}
export default function SettingsPage(){
 const [prefs,setPrefs]=useState<Prefs>(defaults);
 const [saved,setSaved]=useState(false);
 useEffect(()=>{
  try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);setPrefs({...defaults,...parsed,answerStyle:["Simple","Balanced","Detailed"].includes(parsed.answerStyle)?parsed.answerStyle:"Balanced",voiceSpeed:["0.75","1","1.25","1.5"].includes(parsed.voiceSpeed)?parsed.voiceSpeed:"1",dailyGoal:["15","30","45","60"].includes(parsed.dailyGoal)?parsed.dailyGoal:"30"});}}catch{}
  document.documentElement.dataset.theme="dark";document.documentElement.dataset.mbTheme="dark";localStorage.setItem("mb-theme","Dark");
  try{const appearance=JSON.parse(localStorage.getItem("mah-buddy-site-appearance")||"{}");applyAppearance({...defaults,...appearance});}catch{applyAppearance(defaults);}
 },[]);
 function applyAppearance(value:Partial<Prefs>){
  const palette=palettes[value.palette||"forest"]||palettes.forest;
  const chosen=value.accent&&/^#[0-9a-fA-F]{6}$/.test(value.accent)?value.accent:palette.accent;
  const root=document.documentElement;
  root.style.setProperty("--mb-ink",palette.bg);root.style.setProperty("--mb-ink-raised",palette.surface);root.style.setProperty("--mb-surface",palette.surface);root.style.setProperty("--mb-surface-raised",palette.raised);
  root.style.setProperty("--mb-violet",chosen);root.style.setProperty("--mb-violet-bright",chosen);root.style.setProperty("--mb-cyan",chosen);root.style.setProperty("--mb-accent",chosen);
  root.style.setProperty("--mb-cloud","#F0F4F0");root.style.setProperty("--mb-muted",palette.muted);root.style.setProperty("--mb-border",chosen+"35");root.style.setProperty("--mb-border-strong",chosen+"70");root.style.setProperty("--mb-focus","0 0 0 3px "+chosen+"45");root.style.colorScheme="dark";
  try{localStorage.setItem("mah-buddy-site-appearance",JSON.stringify({palette:value.palette||"forest",accent:chosen}));}catch{}
 }
 function update(patch:Partial<Prefs>){
  const next={...prefs,...patch};setPrefs(next);applyAppearance(next);
  try{localStorage.setItem(KEY,JSON.stringify(next));localStorage.setItem("mb-voice",String(next.voice));localStorage.setItem("mb-auto-speak",String(next.autoSpeak));localStorage.setItem("mb-enter",String(next.enterToSend));localStorage.setItem("mah-buddy-daily-goal",next.dailyGoal);localStorage.setItem("mah-buddy-reminders",String(next.reminders));localStorage.setItem("mah-buddy-revision-enabled",String(next.revision));window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));}catch{}
  setSaved(true);window.setTimeout(()=>setSaved(false),1400);
 }
 function reset(){if(!window.confirm("Reset all Mah Buddy settings to their defaults? Your notes, chats and study progress will stay saved."))return;update(defaults);}
 const toggle=(label:string,value:boolean,onChange:(v:boolean)=>void)=><Toggle value={value} onChange={onChange} label={label}/>;
 return <main style={{minHeight:"100dvh",background:"var(--mb-ink,#141916)",color:"#F0F4F0",fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif",paddingBottom:"calc(30px + env(safe-area-inset-bottom))"}}>
  <header style={{position:"sticky",top:0,zIndex:10,minHeight:62,display:"flex",alignItems:"center",gap:13,padding:"0 18px",borderBottom:"1px solid rgba(160,180,164,.16)",background:"var(--mb-ink,#141916)",backdropFilter:"blur(16px)"}}>
   <a href="/profile" aria-label="Back to profile" style={{display:"grid",placeItems:"center",width:36,height:36,border:"1px solid "+line,borderRadius:12,color:"#C2CEC6",fontSize:22,textDecoration:"none"}}>←</a>
   <div style={{flex:1}}><div style={{fontSize:15,fontWeight:750}}>Settings</div><div style={{fontSize:10,color:muted,marginTop:2}}>Your space, your rules</div></div>
   <span aria-live="polite" style={{fontSize:11,color:accent,minWidth:54,textAlign:"right"}}>{saved?"Saved ✓":""}</span>
  </header>
  <div style={{width:"min(100%,700px)",margin:"0 auto",padding:"24px 15px 24px"}}>
   <div style={{position:"relative",overflow:"hidden",padding:"22px 20px 24px",marginBottom:17,border:"1px solid "+line,borderRadius:22,background:"linear-gradient(145deg,var(--mb-surface-raised,#263B30),var(--mb-surface,#1D2922))"}}>
    <div aria-hidden="true" style={{position:"absolute",right:-24,top:-44,width:150,height:150,borderRadius:"50%",border:"1px solid "+line,boxShadow:"0 0 0 22px rgba(155,232,244,.025),0 0 0 44px rgba(155,232,244,.018)"}}/>
    <div style={{display:"inline-flex",alignItems:"center",gap:7,color:accent,fontSize:9,fontWeight:850,letterSpacing:".16em"}}><span style={{width:7,height:7,borderRadius:9,background:accent}}/> YOUR LEARNING SPACE</div>
    <h1 style={{position:"relative",fontSize:"clamp(30px,7vw,41px)",letterSpacing:"-.055em",lineHeight:1.08,margin:"13px 0 9px",fontWeight:680}}>Make it <span style={{color:accent}}>yours.</span></h1>
    <p style={{position:"relative",maxWidth:390,color:muted,fontSize:12,lineHeight:1.7,margin:0}}>Fine-tune how Mah Buddy looks, explains and helps you revise. Changes save automatically on this device.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}><span style={{fontSize:10,padding:"7px 10px",borderRadius:99,border:"1px solid "+line,color:"#DCE5DE"}}>◈ Personalised</span><span style={{fontSize:10,padding:"7px 10px",borderRadius:99,border:"1px solid "+line,color:"#DCE5DE"}}>✓ Auto-saved</span></div>
   </div>
   <Section number="01" kicker="APPEARANCE" title="Set the atmosphere">
    <SettingRow title="Whole-site theme" description="Choose the background and surfaces across Mah Buddy."><select aria-label="Whole-site theme" value={prefs.palette} onChange={e=>update({palette:e.target.value as Palette})} style={control}>{(Object.keys(palettes) as Palette[]).map(key=><option key={key} value={key}>{palettes[key].name}</option>)}</select></SettingRow>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,padding:"13px 0 15px"}}>{(Object.keys(palettes) as Palette[]).map(key=><button key={key} type="button" aria-pressed={prefs.palette===key} aria-label={palettes[key].name+" theme"} onClick={()=>update({palette:key})} style={{display:"flex",alignItems:"center",gap:7,minWidth:0,border:"1px solid "+(prefs.palette===key?accent:"rgba(160,180,164,.16)"),borderRadius:12,padding:"10px 8px",background:palettes[key].bg,color:"#F0F4F0",fontSize:10,textAlign:"left",boxShadow:prefs.palette===key?"0 0 0 1px "+accent+"35":"none"}}><span style={{width:14,height:14,flexShrink:0,borderRadius:50,background:palettes[key].accent,boxShadow:"0 0 0 3px "+palettes[key].surface}}/><span style={{overflowWrap:"anywhere"}}>{palettes[key].name}</span>{prefs.palette===key&&<span style={{marginLeft:"auto",color:accent}}>✓</span>}</button>)}</div>
    <SettingRow title="Custom accent colour" description="Independent from your theme selection."><input aria-label="Custom accent colour" type="color" value={prefs.accent} onChange={e=>update({accent:e.target.value})} style={{width:48,height:38,padding:3,border:"1px solid "+line,borderRadius:10,background:"#172019"}}/></SettingRow>
    <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:13}}><span style={{width:25,height:25,borderRadius:8,background:prefs.accent,boxShadow:"0 0 18px "+prefs.accent+"30"}}/><span style={{fontSize:11,color:muted}}>Accent preview</span><span style={{marginLeft:"auto",padding:"8px 12px",borderRadius:10,background:prefs.accent,color:"#142126",fontSize:11,fontWeight:800}}>Preview</span></div>
   </Section>
   <Section number="02" kicker="AI & LEARNING" title="How you learn">
    <SettingRow title="Answer style" description="How detailed should explanations be?"><select aria-label="Answer style" value={prefs.answerStyle} onChange={e=>update({answerStyle:e.target.value as Prefs["answerStyle"]})} style={control}><option>Simple</option><option>Balanced</option><option>Detailed</option></select></SettingRow>
    <SettingRow title="Default difficulty" description="Starting level for quizzes and practice."><select aria-label="Default difficulty" value={prefs.difficulty} onChange={e=>update({difficulty:e.target.value as Difficulty})} style={control}><option>Easy</option><option>Normal</option><option>Hard</option></select></SettingRow>
    <SettingRow title="Questions per session" description="Your preferred quiz length."><select aria-label="Questions per session" value={prefs.questions} onChange={e=>update({questions:e.target.value})} style={control}>{["5","10","20","25","50","Custom"].map(n=><option key={n} value={n}>{n==="Custom"?"Custom":n+" questions"}</option>)}</select></SettingRow>
    <SettingRow title="Use learning preferences" description="Let your saved study preferences guide responses.">{toggle("Use learning preferences",prefs.memory,v=>update({memory:v}))}</SettingRow>
   </Section>
   <Section number="03" kicker="VOICE & SPEECH" title="Listen your way">
    <SettingRow title="Voice input" description="Use your microphone in chat.">{toggle("Voice input",prefs.voice,v=>update({voice:v}))}</SettingRow>
    <SettingRow title="Read answers aloud" description="Automatically speak written answers.">{toggle("Read answers aloud",prefs.autoSpeak,v=>update({autoSpeak:v}))}</SettingRow>
    <SettingRow title="Voice language" description="Speech uses British English."><span style={{fontSize:12,color:accent,fontWeight:700}}>British English</span></SettingRow>
    <SettingRow title="Speech speed" description="Adjust how quickly answers are spoken."><select aria-label="Speech speed" value={prefs.voiceSpeed} onChange={e=>update({voiceSpeed:e.target.value})} style={control}><option value="0.75">0.75× Slow</option><option value="1">1× Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5× Fast</option></select></SettingRow>
   </Section>
   <Section number="04" kicker="STUDY & REVISION" title="Build a routine">
    <SettingRow title="Daily study goal" description="Minutes you aim to study each day."><select aria-label="Daily study goal" value={prefs.dailyGoal} onChange={e=>update({dailyGoal:e.target.value})} style={control}>{["15","30","45","60"].map(n=><option key={n} value={n}>{n+" minutes"}</option>)}</select></SettingRow>
    <SettingRow title="Smart revision" description="Keep spaced-repetition review enabled.">{toggle("Smart revision",prefs.revision,v=>update({revision:v}))}</SettingRow>
    <SettingRow title="Study reminders" description="Preference for future study reminders.">{toggle("Study reminders",prefs.reminders,v=>update({reminders:v}))}</SettingRow>
   </Section>
   <Section number="05" kicker="CHAT BEHAVIOUR" title="Make chat comfortable">
    <SettingRow title="Enter to send" description="Press Enter to send; Shift + Enter starts a new line.">{toggle("Enter to send",prefs.enterToSend,v=>update({enterToSend:v}))}</SettingRow>
    <SettingRow title="Reduced motion" description="Reduce interface animations where supported.">{toggle("Reduced motion",prefs.reducedMotion,v=>{update({reducedMotion:v});document.documentElement.classList.toggle("mb-reduced-motion",v)})}</SettingRow>
   </Section>
   <Section number="06" kicker="PRIVACY & SECURITY" title="Your data">
    <SettingRow title="Local study data" description="Export or clear saved notes, chats and progress."><a href="/settings/privacy" style={{fontSize:12,color:accent,textDecoration:"none",fontWeight:750,whiteSpace:"nowrap"}}>Manage →</a></SettingRow>
    <SettingRow title="Privacy policy" description="Read how Mah Buddy handles information."><a href="/privacy-policy" style={{fontSize:12,color:accent,textDecoration:"none",fontWeight:750,whiteSpace:"nowrap"}}>Read →</a></SettingRow>
    <SettingRow title="Saved preferences" description="Your settings are stored locally on this device."><span style={{fontSize:11,color:muted,whiteSpace:"nowrap"}}>On device</span></SettingRow>
   </Section>
   <Section number="07" kicker="YOUR ACCOUNT" title="Quick links">
    <SettingRow title="Study Centre" description="Open quizzes, notes, revision and planner."><a href="/study" style={{fontSize:12,color:accent,textDecoration:"none",fontWeight:750,whiteSpace:"nowrap"}}>Open →</a></SettingRow>
    <SettingRow title="Your profile" description="Manage your learning details."><a href="/profile" style={{fontSize:12,color:accent,textDecoration:"none",fontWeight:750,whiteSpace:"nowrap"}}>Profile →</a></SettingRow>
   </Section>
   <button type="button" onClick={reset} style={{width:"100%",marginTop:3,padding:14,border:"1px solid rgba(160,180,164,.25)",borderRadius:13,background:"transparent",color:"#C2CEC6",fontSize:12,fontWeight:750}}>Reset settings to defaults</button>
   <p style={{fontSize:10,lineHeight:1.7,color:"#718077",textAlign:"center",margin:"18px 10px 0"}}>Mah Buddy · Minimal Studio · Dark Forest<br/>Settings save automatically on this device.</p>
  </div>
 </main>;
}
