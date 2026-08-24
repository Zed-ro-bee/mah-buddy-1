"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Theme = "System" | "Light" | "Dark";
type Difficulty = "Easy" | "Medium" | "Hard";
type Prefs = { theme: Theme; voice: boolean; autoSpeak: boolean; memory: boolean; notifications: boolean; reducedMotion: boolean; difficulty: Difficulty; questions: string; enterToSend: boolean };

const KEY = "mah-buddy-prefs";
const defaults: Prefs = { theme: "System", voice: true, autoSpeak: false, memory: true, notifications: true, reducedMotion: false, difficulty: "Medium", questions: "10", enterToSend: true };

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

function Logo({ size = 36 }: { size?: number }) {
  return <img src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy" />;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={value ? "switch on" : "switch"} aria-pressed={value} onClick={() => onChange(!value)}><span /></button>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="setting-row"><div className="row-copy"><strong>{title}</strong><span>{description}</span></div>{children}</div>;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [customQuestions, setCustomQuestions] = useState(25);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const next = { ...defaults, ...JSON.parse(stored) } as Prefs;
        setPrefs(next);
        if (next.questions !== "Custom") setCustomQuestions(Math.max(1, Number(next.questions) || 25));
        document.documentElement.dataset.mbTheme = next.theme.toLowerCase();
      }
    } catch {}
  }, []);

  function update(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    document.documentElement.dataset.mbTheme = next.theme.toLowerCase();
    window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));
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
      const client = supabaseClient();
      if (client) await client.auth.signOut();
      window.location.href = "/";
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="settings-app">
      <header className="settings-header">
        <a href="/" className="icon-back" aria-label="Back">←</a>
        <div className="header-title"><Logo size={30} /><div><strong>Settings</strong><span>Mah Buddy</span></div></div>
        <span className="saved">{saved ? "Saved ✓" : ""}</span>
      </header>

      <div className="settings-content">
        <section className="settings-hero">
          <div className="hero-orb"><Logo size={58} /></div>
          <div><span className="eyebrow">PERSONAL CONTROL</span><h1>Make it yours.</h1><p>Fine-tune Mah Buddy so every study session feels natural to you.</p></div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>APPEARANCE</span><h2>Look & feel</h2></div></div>
          <div className="theme-grid">
            {(["Light", "Dark", "System"] as Theme[]).map((theme) => (
              <button key={theme} type="button" className={prefs.theme === theme ? "theme-card active" : "theme-card"} onClick={() => update({ theme })}>
                <span className={`theme-preview ${theme.toLowerCase()}`}><i /></span><b>{theme}</b><small>{theme === "System" ? "Follow device" : theme === "Dark" ? "Easy on the eyes" : "Bright & clean"}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>VOICE</span><h2>Conversation</h2></div></div>
          <SettingRow title="Voice responses" description="Let Mah Buddy speak answers."><Toggle value={prefs.voice} onChange={(voice) => update({ voice })} /></SettingRow>
          <SettingRow title="Auto-speak" description="Read new answers aloud automatically."><Toggle value={prefs.autoSpeak} onChange={(autoSpeak) => update({ autoSpeak, voice: autoSpeak || prefs.voice })} /></SettingRow>
          <div className="inline-note"><span>Voice language</span><b>British English</b></div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>STUDY</span><h2>Learning defaults</h2></div></div>
          <div className="field-block"><label>Difficulty</label><div className="seg">
            {(["Easy", "Medium", "Hard"] as Difficulty[]).map((value) => <button key={value} type="button" className={prefs.difficulty === value ? "selected" : ""} onClick={() => update({ difficulty: value })}>{value}</button>)}
          </div></div>
          <div className="field-block"><label>Questions per session</label><div className="seg">
            {["5", "10", "20", "Custom"].map((value) => <button key={value} type="button" className={prefs.questions === value ? "selected" : ""} onClick={() => { if (value === "Custom") { setCustomQuestions(customQuestions || 25); } update({ questions: value }); }}>{value}</button>)}
          </div></div>
          {prefs.questions === "Custom" && <div className="custom-wrap"><input type="number" min="1" max="100" value={customQuestions} onChange={(event) => { const number = Math.max(1, Math.min(100, Number(event.target.value) || 1)); setCustomQuestions(number); update({ questions: String(number) }); }} /><span>questions</span></div>}
        </section>

        <section className="panel">
          <div className="panel-heading"><div><span>BEHAVIOUR</span><h2>How Mah Buddy works</h2></div></div>
          <SettingRow title="Enter to send" description="Send messages with the Enter key."><Toggle value={prefs.enterToSend} onChange={(enterToSend) => update({ enterToSend })} /></SettingRow>
          <SettingRow title="Memory" description="Use your saved study preferences."><Toggle value={prefs.memory} onChange={(memory) => update({ memory })} /></SettingRow>
          <SettingRow title="Notifications" description="Receive helpful study reminders."><Toggle value={prefs.notifications} onChange={(notifications) => update({ notifications })} /></SettingRow>
          <SettingRow title="Reduced motion" description="Use gentler animations throughout the app."><Toggle value={prefs.reducedMotion} onChange={(reducedMotion) => update({ reducedMotion })} /></SettingRow>
        </section>

        <section className="panel danger-panel">
          <div className="panel-heading"><div><span>DATA</span><h2>Your data</h2></div></div>
          <button type="button" className="data-action" onClick={clearHistory}><div><strong>Clear chat history</strong><span>Remove conversations stored on this device.</span></div><b>Clear</b></button>
        </section>

        <a href="/profile" className="profile-card-link"><span className="profile-avatar"><Logo size={26} /></span><div><strong>Profile</strong><small>Personal details & learning goals</small></div><b>→</b></a>
        <button type="button" className="signout" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>
      </div>
    </main>
  );
}
