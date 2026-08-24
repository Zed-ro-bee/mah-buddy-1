"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Prefs = {
  theme: "System" | "Light" | "Dark";
  voice: boolean;
  autoSpeak: boolean;
  memory: boolean;
  notifications: boolean;
  reducedMotion: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: string;
  enterToSend: boolean;
};

const KEY = "mah-buddy-prefs";
const defaults: Prefs = {
  theme: "System",
  voice: true,
  autoSpeak: false,
  memory: true,
  notifications: true,
  reducedMotion: false,
  difficulty: "Medium",
  questions: "10",
  enterToSend: true,
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

function Mark({ size = 38 }: { size?: number }) {
  return <img src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy" />;
}

function Icon({ kind }: { kind: string }) {
  return (
    <span className="picon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === "mic" ? <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></> :
         kind === "monitor" ? <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></> :
         kind === "moon" ? <path d="M20.7 15.2A8.7 8.7 0 0 1 8.8 3.3 8.7 8.7 0 1 0 20.7 15.2Z"/> :
         <path d="m12 3 1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6L12 3Z"/>}
      </svg>
    </span>
  );
}

function Toggle({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
  return <button type="button" aria-pressed={on} className={on ? "switch on" : "switch"} onClick={() => setOn(!on)}><span /></button>;
}

function Seg({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return <div className="seg">{options.map(option => <button key={option} type="button" className={value === option ? "selected" : ""} onClick={() => onChange(option)}>{option}</button>)}</div>;
}

function Row({ kind, title, sub, children }: { kind: string; title: string; sub: string; children: React.ReactNode }) {
  return <div className="setting-row"><Icon kind={kind}/><div className="row-copy"><strong>{title}</strong><span>{sub}</span></div>{children}</div>;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(defaults);
  const [customQuestions, setCustomQuestions] = useState(25);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    try {
      const loaded = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") } as Prefs;
      setPrefs(loaded);
      if (loaded.questions !== "Custom") setCustomQuestions(Math.max(1, Number(loaded.questions) || 25));
      applyTheme(loaded.theme);
    } catch {
      applyTheme("System");
    }
  }, []);

  function applyTheme(theme: string) {
    document.documentElement.dataset.mbTheme = theme.toLowerCase();
    window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));
  }

  function update(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    applyTheme(next.theme);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
  }

  function clearHistory() {
    localStorage.removeItem("mah-buddy-chat");
    localStorage.removeItem("mah-buddy-chats");
    window.dispatchEvent(new CustomEvent("mah-buddy-chat-cleared"));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const client = getSupabase();
      if (client) await client.auth.signOut();
      localStorage.removeItem("mah-buddy-onboarding-seen");
      window.location.href = "/";
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="settings-app">
      <div className="ambient a" />
      <div className="ambient b" />

      <header className="settings-header">
        <a href="/" className="icon-back" aria-label="Back to Mah Buddy">←</a>
        <div className="header-title"><Mark size={30}/><div><strong>Settings</strong><span>Mah Buddy</span></div></div>
        {saved ? <span className="saved" role="status">Saved ✓</span> : <span className="header-dot" />}
      </header>

      <div className="settings-content">
        <section className="settings-hero">
          <div className="hero-orb"><Mark size={62}/></div>
          <div><span className="eyebrow">PERSONAL CONTROL</span><h1>Make it yours.</h1><p>Fine-tune Mah Buddy so every study session feels natural to you.</p></div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>APPEARANCE</span><h2>Look & feel</h2></div><Icon kind="spark"/></div>
          <div className="theme-grid">
            {(["Light", "Dark", "System"] as const).map(theme => <button key={theme} type="button" className={prefs.theme === theme ? "theme-card active" : "theme-card"} onClick={() => update({ theme })}>
              <span className={`theme-preview ${theme.toLowerCase()}`}><i/></span><b>{theme}</b><small>{theme === "Light" ? "Bright & clean" : theme === "Dark" ? "Easy on the eyes" : "Follow device"}</small>
            </button>)}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>VOICE</span><h2>Conversation</h2></div><Icon kind="mic"/></div>
          <Row kind="mic" title="Voice responses" sub="Let Mah Buddy speak answers."><Toggle on={prefs.voice} setOn={v => update({ voice: v })}/></Row>
          <Row kind="spark" title="Auto-speak" sub="Read new answers aloud automatically."><Toggle on={prefs.autoSpeak} setOn={v => update({ autoSpeak: v, voice: v || prefs.voice })}/></Row>
          <div className="inline-note"><span>Voice language</span><b>British English</b></div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>STUDY</span><h2>Learning defaults</h2></div><Icon kind="spark"/></div>
          <div className="field-block"><label>Difficulty</label><Seg value={prefs.difficulty} options={["Easy", "Medium", "Hard"]} onChange={v => update({ difficulty: v as Prefs["difficulty"] })}/></div>
          <div className="field-block">
            <label>Questions per session</label>
            <Seg value={prefs.questions} options={["5", "10", "20", "Custom"]} onChange={v => { if (v === "Custom") setCustomQuestions(customQuestions || 25); update({ questions: v }); }}/>
            {prefs.questions === "Custom" && <div className="custom-wrap"><input type="number" min="1" max="100" value={customQuestions} onChange={e => { const n = Math.max(1, Math.min(100, Number(e.target.value) || 1)); setCustomQuestions(n); update({ questions: String(n) }); }}/><span>questions</span></div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>BEHAVIOUR</span><h2>How Mah Buddy works</h2></div><Icon kind="monitor"/></div>
          <Row kind="spark" title="Enter to send" sub="Send messages with the Enter key."><Toggle on={prefs.enterToSend} setOn={v => update({ enterToSend: v })}/></Row>
          <Row kind="spark" title="Memory" sub="Use your saved study preferences."><Toggle on={prefs.memory} setOn={v => update({ memory: v })}/></Row>
          <Row kind="monitor" title="Notifications" sub="Receive helpful study reminders."><Toggle on={prefs.notifications} setOn={v => update({ notifications: v })}/></Row>
          <Row kind="moon" title="Reduced motion" sub="Use gentler animations throughout the app."><Toggle on={prefs.reducedMotion} setOn={v => update({ reducedMotion: v })}/></Row>
        </section>

        <section className="panel danger-panel">
          <div className="panel-heading"><div><span>DATA</span><h2>Your data</h2></div></div>
          <button type="button" className="data-action" onClick={clearHistory}><div><strong>Clear chat history</strong><span>Remove conversations stored on this device.</span></div><b>Clear</b></button>
        </section>

        <a href="/profile" className="profile-card-link"><span className="profile-avatar"><Mark size={27}/></span><div><strong>Profile</strong><small>Personal details & learning goals</small></div><b>→</b></a>
        <button type="button" className="signout" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>
      </div>
    </main>
  );
}
