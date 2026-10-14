"use client";

import { useEffect, useState } from "react";

type Difficulty = "Easy" | "Normal" | "Hard";
type Palette = "forest" | "ocean" | "violet" | "rose" | "amber" | "midnight";
type Prefs = {
  voice:boolean; autoSpeak:boolean; memory:boolean; notifications:boolean; reducedMotion:boolean;
  difficulty:Difficulty; questions:string; enterToSend:boolean; answerStyle:"Simple"|"Balanced"|"Detailed";
  voiceSpeed:string; dailyGoal:string; reminders:boolean; revision:boolean; palette:Palette; accent:string;
};
const palettes:Record<Palette,{name:string;bg:string;surface:string;raised:string;accent:string;muted:string}> = {
  forest:{name:"Dark Forest",bg:"#141916",surface:"#1D2922",raised:"#263B30",accent:"#9BE8F4",muted:"#A0ACA3"},
  ocean:{name:"Deep Ocean",bg:"#101923",surface:"#182A39",raised:"#213D50",accent:"#71D8FF",muted:"#9CB5C6"},
  violet:{name:"Violet Night",bg:"#191523",surface:"#282038",raised:"#3B2D52",accent:"#C6A5FF",muted:"#B0A6C2"},
  rose:{name:"Rose Ember",bg:"#211719",surface:"#332225",raised:"#4A2E35",accent:"#FF9EBC",muted:"#C6A6AD"},
  amber:{name:"Amber Dusk",bg:"#211D14",surface:"#332B1D",raised:"#4A3B25",accent:"#FFD080",muted:"#C1B49A"},
  midnight:{name:"Midnight Blue",bg:"#111827",surface:"#1C273B",raised:"#293A56",accent:"#A5BFFF",muted:"#A5B0C5"}
};
const defaults:Prefs={voice:true,autoSpeak:false,memory:true,notifications:true,reducedMotion:false,difficulty:"Normal",questions:"10",enterToSend:true,answerStyle:"Balanced",voiceSpeed:"1",dailyGoal:"30",reminders:false,revision:true,palette:"forest",accent:palettes.forest.accent};
const KEY="mah-buddy-prefs";
function Switch({value,label,onChange}:{value:boolean;label:string;onChange:(value:boolean)=>void}) {
  return <button className={"mb-pref-switch"+(value?" is-on":"")} type="button" role="switch" aria-checked={value} aria-label={label} onClick={()=>onChange(!value)}><span/></button>;
}
function Row({title,description,children}:{title:string;description:string;children:React.ReactNode}) {
  return <div className="mb-pref-row"><div className="mb-pref-row-copy"><strong>{title}</strong><p>{description}</p></div><div className="mb-pref-row-control">{children}</div></div>;
}
function Group({id,title,subtitle,children}:{id:string;title:string;subtitle:string;children:React.ReactNode}) {
  return <section className="mb-pref-group" id={id}><div className="mb-pref-group-head"><span>{subtitle}</span><h2>{title}</h2></div>{children}</section>;
}
export default function SettingsPage() {
  const [prefs,setPrefs]=useState<Prefs>(defaults);
  const [saved,setSaved]=useState(false);
  useEffect(()=>{
    try {
      const raw=JSON.parse(localStorage.getItem(KEY)||"{}");
      const next={...defaults,...raw};
      if(!palettes[next.palette as Palette])next.palette="forest";
      if(!["Simple","Balanced","Detailed"].includes(next.answerStyle))next.answerStyle="Balanced";
      if(!["Easy","Normal","Hard"].includes(next.difficulty))next.difficulty=raw.difficulty==="Medium"?"Normal":"Normal";
      if(!["0.75","1","1.25","1.5"].includes(next.voiceSpeed))next.voiceSpeed="1";
      if(!["15","30","45","60"].includes(next.dailyGoal))next.dailyGoal="30";
      if(!/^#[0-9a-fA-F]{6}$/.test(next.accent||""))next.accent=palettes[next.palette as Palette].accent;
      setPrefs(next);
      applyAppearance(next);
      document.documentElement.classList.toggle("mb-reduced-motion",!!next.reducedMotion);
    } catch { applyAppearance(defaults); }
  },[]);
  function applyAppearance(value:Partial<Prefs>) {
    const palette=palettes[value.palette||"forest"]||palettes.forest;
    const chosen=value.accent&&/^#[0-9a-fA-F]{6}$/.test(value.accent)?value.accent:palette.accent;
    const root=document.documentElement;
    root.dataset.theme="dark";root.dataset.mbTheme="dark";root.style.colorScheme="dark";
    root.style.setProperty("--mb-ink",palette.bg);root.style.setProperty("--mb-ink-raised",palette.surface);
    root.style.setProperty("--mb-surface",palette.surface);root.style.setProperty("--mb-surface-raised",palette.raised);
    root.style.setProperty("--mb-violet",chosen);root.style.setProperty("--mb-violet-bright",chosen);
    root.style.setProperty("--mb-cyan",chosen);root.style.setProperty("--mb-accent",chosen);
    root.style.setProperty("--mb-cloud","#F0F4F0");root.style.setProperty("--mb-muted",palette.muted);
    root.style.setProperty("--mb-border",chosen+"35");root.style.setProperty("--mb-border-strong",chosen+"70");
    root.style.setProperty("--mb-focus","0 0 0 3px "+chosen+"45");
    try{localStorage.setItem("mah-buddy-site-appearance",JSON.stringify({palette:value.palette||"forest",accent:chosen}));localStorage.setItem("mb-theme","Dark");}catch{}
  }
  function update(patch:Partial<Prefs>) {
    const next={...prefs,...patch};
    if(patch.palette && !patch.accent) next.accent=palettes[patch.palette].accent;
    setPrefs(next);applyAppearance(next);
    document.documentElement.classList.toggle("mb-reduced-motion",!!next.reducedMotion);
    try {
      localStorage.setItem(KEY,JSON.stringify(next));
      localStorage.setItem("mb-voice",String(next.voice));
      localStorage.setItem("mb-auto-speak",String(next.autoSpeak));
      localStorage.setItem("mb-enter",String(next.enterToSend));
      localStorage.setItem("mb-voice-speed",next.voiceSpeed);
      localStorage.setItem("mah-buddy-daily-goal",next.dailyGoal);
      localStorage.setItem("mah-buddy-reminders",String(next.reminders));
      localStorage.setItem("mah-buddy-revision-enabled",String(next.revision));
      window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));
    } catch {}
    setSaved(true);window.setTimeout(()=>setSaved(false),1500);
  }
  function reset() {
    if(!window.confirm("Reset Mah Buddy settings to their defaults? Your chats, notes and study progress will remain saved."))return;
    update(defaults);
  }
  const selectClass="mb-pref-select";
  return <main className="mb-settings-page">
    <header className="mb-pref-topbar">
      <a href="/" className="mb-pref-back" aria-label="Back to AI Assistance">‹</a>
      <div className="mb-pref-top-title"><strong>Settings</strong><span>Personalise your Mah Buddy</span></div>
      <span className="mb-pref-saved" aria-live="polite">{saved?"Saved ✓":""}</span>
    </header>
    <div className="mb-pref-layout">
      <div className="mb-pref-intro"><span className="mb-pref-eyebrow">YOUR SPACE · YOUR RULES</span><h1>Make it yours.</h1><p>Adjust how Mah Buddy looks, speaks and helps you learn. Your choices save automatically on this device.</p></div>
      <Group id="appearance" subtitle="01 · LOOK & FEEL" title="Appearance">
        <Row title="Colour theme" description="Choose your workspace colour."><select className={selectClass} aria-label="Colour theme" value={prefs.palette} onChange={e=>update({palette:e.target.value as Palette})}>{(Object.keys(palettes) as Palette[]).map(k=><option key={k} value={k}>{palettes[k].name}</option>)}</select></Row>
        <div className="mb-pref-palette-grid">{(Object.keys(palettes) as Palette[]).map(k=><button type="button" key={k} className={"mb-pref-palette"+(prefs.palette===k?" selected":"")} aria-pressed={prefs.palette===k} onClick={()=>update({palette:k})}><span style={{background:palettes[k].bg}}><i style={{background:palettes[k].accent}}/></span><b>{palettes[k].name}</b>{prefs.palette===k&&<em>✓</em>}</button>)}</div>
        <Row title="Accent colour" description="Pick a highlight colour for buttons and focus states."><input className="mb-pref-color" aria-label="Accent colour" type="color" value={prefs.accent} onChange={e=>update({accent:e.target.value})}/></Row>
      </Group>
      <Group id="learning" subtitle="02 · AI & LEARNING" title="How you learn">
        <Row title="Answer style" description="Choose the usual level of detail."><select className={selectClass} aria-label="Answer style" value={prefs.answerStyle} onChange={e=>update({answerStyle:e.target.value as Prefs["answerStyle"]})}><option>Simple</option><option>Balanced</option><option>Detailed</option></select></Row>
        <Row title="Default practice difficulty" description="Starting difficulty for quizzes and practice."><select className={selectClass} aria-label="Default practice difficulty" value={prefs.difficulty} onChange={e=>update({difficulty:e.target.value as Difficulty})}><option>Easy</option><option>Normal</option><option>Hard</option></select></Row>
        <Row title="Questions per quiz" description="Preferred number when starting a quiz."><select className={selectClass} aria-label="Questions per quiz" value={prefs.questions} onChange={e=>update({questions:e.target.value})}>{["5","10","20","25","50"].map(n=><option key={n} value={n}>{n} questions</option>)}</select></Row>
        <Row title="Use learning preferences" description="Use your saved study profile to tailor explanations."><Switch label="Use learning preferences" value={prefs.memory} onChange={v=>update({memory:v})}/></Row>
      </Group>
      <Group id="voice" subtitle="03 · VOICE & SPEECH" title="Listen your way">
        <Row title="Voice input" description="Allow speech-to-text in chat."><Switch label="Voice input" value={prefs.voice} onChange={v=>update({voice:v})}/></Row>
        <Row title="Read answers aloud" description="Speak new AI answers automatically."><Switch label="Read answers aloud" value={prefs.autoSpeak} onChange={v=>update({autoSpeak:v})}/></Row>
        <Row title="Voice language" description="The assistant uses British English for speech."><span className="mb-pref-static">British English</span></Row>
        <Row title="Speaking speed" description="Set the pace of spoken answers."><select className={selectClass} aria-label="Speaking speed" value={prefs.voiceSpeed} onChange={e=>update({voiceSpeed:e.target.value})}><option value="0.75">0.75× · Slow</option><option value="1">1× · Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5× · Fast</option></select></Row>
      </Group>
      <Group id="study" subtitle="04 · STUDY ROUTINE" title="Build a routine">
        <Row title="Daily study goal" description="Set a realistic daily learning target."><select className={selectClass} aria-label="Daily study goal" value={prefs.dailyGoal} onChange={e=>update({dailyGoal:e.target.value})}>{["15","30","45","60"].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></Row>
        <Row title="Smart revision" description="Keep your revision and review tools enabled."><Switch label="Smart revision" value={prefs.revision} onChange={v=>update({revision:v})}/></Row>
        <Row title="Study reminders" description="Save your preference for reminder features."><Switch label="Study reminders" value={prefs.reminders} onChange={v=>update({reminders:v})}/></Row>
      </Group>
      <Group id="chat" subtitle="05 · CHAT EXPERIENCE" title="Comfortable chat">
        <Row title="Enter to send" description="Enter sends; Shift + Enter creates a new line."><Switch label="Enter to send" value={prefs.enterToSend} onChange={v=>update({enterToSend:v})}/></Row>
        <Row title="Reduced motion" description="Reduce animations across supported screens."><Switch label="Reduced motion" value={prefs.reducedMotion} onChange={v=>update({reducedMotion:v})}/></Row>
      </Group>
      <Group id="privacy" subtitle="06 · PRIVACY & ACCOUNT" title="Your data, your choice">
        <a className="mb-pref-link-row" href="/settings/privacy"><span><strong>Privacy & data</strong><small>Export or clear data saved on this device</small></span><b>›</b></a>
        <a className="mb-pref-link-row" href="/privacy-policy"><span><strong>Privacy policy</strong><small>How Mah Buddy handles information</small></span><b>›</b></a>
        <a className="mb-pref-link-row" href="/terms-of-service"><span><strong>Terms of service</strong><small>Read the terms for using Mah Buddy</small></span><b>›</b></a>
        <a className="mb-pref-link-row" href="/profile"><span><strong>Your profile</strong><small>Manage your details and learning profile</small></span><b>›</b></a>
      </Group>
      <button className="mb-pref-reset" type="button" onClick={reset}>Reset settings to defaults</button>
      <p className="mb-pref-footnote">Mah Buddy · Minimal Studio<br/>Settings are saved on this device. Study reminders are a saved preference and may require notification support to send alerts.</p>
    </div>
  </main>;
}
