"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const KEY = "mah-buddy-prefs";
type Theme = "system" | "light" | "dark";
type Settings = { theme: Theme; accent: string; textSize: "small" | "medium" | "large"; voice: boolean; notifications: boolean; memory: boolean; autoSpeak: boolean; reducedMotion: boolean; instructions: string };
const defaults: Settings = { theme: "system", accent: "lilac", textSize: "medium", voice: true, notifications: true, memory: true, autoSpeak: false, reducedMotion: false, instructions: "" };

const accents = [
  { id: "lilac", label: "Lilac", value: "#7468e8" },
  { id: "blue", label: "Sky", value: "#6488d8" },
  { id: "pink", label: "Rose", value: "#d47b9c" },
  { id: "navy", label: "Navy", value: "#30384f" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    try { setSettings({ ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }); } catch {}
    if (supabase) supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mbTheme = settings.theme;
    root.dataset.mbAccent = settings.accent;
    root.style.setProperty("--mb-accent", accents.find(a => a.id === settings.accent)?.value || accents[0].value);
    root.style.setProperty("--mb-text-scale", settings.textSize === "small" ? ".94" : settings.textSize === "large" ? "1.08" : "1");
  }, [settings.theme, settings.accent, settings.textSize]);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function clearChats() {
    localStorage.removeItem("mah-buddy-chats");
    setConfirmClear(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  function exportPreferences() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mah-buddy-settings.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); window.location.href = "/"; }

  return <main className="settings-page">
    <header className="settings-header">
      <a href="/" className="back">←</a>
      <div className="brand"><span className="logo">M</span><div><strong>Mah Buddy</strong><small>APP SETTINGS</small></div></div>
      {saved && <span className="saved">✓ Saved</span>}
    </header>

    <section className="hero"><div><span className="eyebrow">YOUR SPACE</span><h1>Settings</h1><p>Make Mah Buddy feel exactly the way you like to study.</p></div><div className="hero-orb" aria-hidden="true"><span>M</span></div></section>

    <div className="settings-list">
      <section className="card account"><div className="section-head"><div><span className="eyebrow">ACCOUNT</span><h2>Your Mah Buddy</h2></div></div><div className="account-box"><span className="avatar">M</span><div><strong>{email || "Mah Buddy account"}</strong><small>{email ? "Signed in and ready to learn" : "Account details"}</small></div></div></section>

      <section className="card"><div className="section-head"><div><span className="eyebrow">APPEARANCE</span><h2>Make it yours</h2></div></div>
        <div className="field"><div><strong>Theme</strong><small>Choose how Mah Buddy looks.</small></div><div className="segmented">{(["system","light","dark"] as Theme[]).map(t => <button key={t} className={settings.theme === t ? "selected" : ""} onClick={() => update({ theme: t })}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div></div>
        <div className="field"><div><strong>Accent</strong><small>Change the highlight color used across the app.</small></div><div className="accent-list">{accents.map(a => <button key={a.id} aria-label={a.label} title={a.label} className={settings.accent === a.id ? "accent selected" : "accent"} style={{ background: a.value }} onClick={() => update({ accent: a.id })}/>)}</div></div>
        <div className="field"><div><strong>Text size</strong><small>Adjust readability throughout settings.</small></div><div className="segmented">{(["small","medium","large"] as const).map(t => <button key={t} className={settings.textSize === t ? "selected" : ""} onClick={() => update({ textSize: t })}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div></div>
      </section>

      <section className="card"><div className="section-head"><div><span className="eyebrow">VOICE</span><h2>How Mah Buddy speaks</h2></div></div>
        <Toggle title="Voice responses" description="Allow Mah Buddy to speak answers." checked={settings.voice} onChange={v => update({ voice: v })}/>
        <Toggle title="Auto-speak" description="Automatically read new assistant responses aloud." checked={settings.autoSpeak} onChange={v => update({ autoSpeak: v, voice: v ? true : settings.voice })}/>
      </section>

      <section className="card"><div className="section-head"><div><span className="eyebrow">PERSONALIZATION</span><h2>Study preferences</h2></div></div>
        <Toggle title="Memory" description="Let Mah Buddy use your saved study preferences in conversations." checked={settings.memory} onChange={v => update({ memory: v })}/>
        <Toggle title="Notifications" description="Allow helpful app notifications when supported." checked={settings.notifications} onChange={v => update({ notifications: v })}/>
        <Toggle title="Reduced motion" description="Use fewer animations and transitions." checked={settings.reducedMotion} onChange={v => update({ reducedMotion: v })}/>
        <label className="instructions"><strong>How should Mah Buddy help you?</strong><small>These instructions are included with your chat preferences.</small><textarea value={settings.instructions} onChange={e => update({ instructions: e.target.value })} placeholder="Example: Explain difficult topics simply, use examples, and quiz me after teaching." /></label>
      </section>

      <section className="card"><div className="section-head"><div><span className="eyebrow">DATA</span><h2>Your information</h2></div></div><div className="action-row"><div><strong>Export settings</strong><small>Save a copy of your Mah Buddy preferences.</small></div><button className="secondary" onClick={exportPreferences}>Export</button></div><div className="action-row"><div><strong>Clear chat history</strong><small>Remove locally saved conversations from this device.</small></div>{confirmClear ? <div className="confirm"><button className="danger" onClick={clearChats}>Clear</button><button className="secondary" onClick={() => setConfirmClear(false)}>Cancel</button></div> : <button className="secondary" onClick={() => setConfirmClear(true)}>Manage</button>}</div></section>

      <section className="card about"><div className="logo large">M</div><div><span className="eyebrow">ABOUT MAH BUDDY</span><h2>Your AI study companion.</h2><p>Built around the same calm editorial visual language as the Mah Buddy presentation.</p><small>Mah Buddy · v1.0</small></div></section>

      <section className="card signout"><div><span className="eyebrow">ACCOUNT ACTION</span><h2>Sign out</h2><p>Sign out of this Mah Buddy account on this device.</p></div><button className="danger" onClick={signOut}>Sign out</button></section>
    </div>

    <style jsx>{`*{box-sizing:border-box}.settings-page{min-height:100svh;background:#f7f3ee;color:#22232a;font-family:Inter,system-ui,sans-serif;padding:22px max(18px,calc((100vw - 820px)/2));font-size:calc(15px * var(--mb-text-scale,1))}.settings-header{height:56px;display:flex;align-items:center;gap:12px}.back{width:42px;height:42px;border:1px solid #d9d6d1;border-radius:14px;display:grid;place-items:center;text-decoration:none;color:inherit;font-size:22px;background:#fbfaf8}.brand{display:flex;align-items:center;gap:10px}.brand strong{display:block;font-family:Georgia,serif;font-size:15px}.brand small{display:block;font-size:8px;letter-spacing:.18em;opacity:.45;margin-top:2px}.logo{width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#d8d2ff,#b7d7f5 48%,#f1c5d7);display:grid;place-items:center;font-family:Georgia,serif;font-size:20px;font-weight:900;color:#30344a;box-shadow:0 7px 18px #7770a31f}.saved{margin-left:auto;font-size:12px;font-weight:700;color:#5968a5}.hero{margin:26px 0 18px;padding:26px;border:1px solid #ddd8d2;border-radius:25px;background:linear-gradient(120deg,#fbfaf8,#eeeaff 55%,#f7e9ef);display:flex;justify-content:space-between;align-items:center;overflow:hidden}.eyebrow{font-size:9px;letter-spacing:.18em;font-weight:800;opacity:.48}.hero h1{font-family:Georgia,serif;font-size:38px;margin:7px 0 5px}.hero p{margin:0;opacity:.6;font-size:13px}.hero-orb{width:100px;height:100px;border-radius:36px 50px 42px 58px;background:linear-gradient(135deg,#cfc9ff,#b9d9f4 50%,#efc2d6);display:grid;place-items:center;transform:rotate(-8deg);box-shadow:0 20px 45px #7d76b333}.hero-orb span{font-family:Georgia,serif;font-weight:900;font-size:52px;color:#34384d;transform:rotate(8deg)}.settings-list{display:grid;gap:14px}.card{background:#fffdfb;border:1px solid #dedad5;border-radius:21px;padding:20px;box-shadow:0 10px 28px #2e304008}.section-head{margin-bottom:14px}.section-head h2,.about h2,.signout h2{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}.account-box{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid #e4e0dc;border-radius:15px;background:#f8f5f1}.avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d8d2ff,#f0cad9);font-family:Georgia,serif;font-weight:900;font-size:19px}.account-box strong,.account-box small{display:block}.account-box small,.field small,.instructions small,.action-row small,.about p,.signout p{display:block;font-size:11px;opacity:.52;margin-top:3px}.field,.action-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 0;border-top:1px solid #ece8e3}.field:first-of-type,.action-row:first-of-type{border-top:0}.field strong,.action-row strong{font-size:13px}.segmented{display:flex;gap:3px;background:#f0ede9;padding:3px;border-radius:10px}.segmented button{border:0;background:transparent;border-radius:8px;padding:7px 9px;font-size:10px;color:#555;cursor:pointer}.segmented button.selected{background:#fff;color:#292c3b;box-shadow:0 2px 7px #00000010;font-weight:800}.accent-list{display:flex;gap:8px}.accent{width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #d8d3ce;cursor:pointer}.accent.selected{box-shadow:0 0 0 2px #35384b}.instructions{display:block;padding-top:15px;border-top:1px solid #ece8e3}.instructions strong{display:block;font-size:13px}.instructions textarea{width:100%;min-height:105px;margin-top:10px;border:1px solid #dcd7d2;border-radius:13px;padding:12px;background:#fbfaf8;color:inherit;resize:vertical;font:inherit;outline:none}.switch{position:relative;width:45px;height:25px;flex:0 0 auto}.switch input{opacity:0;width:0;height:0}.track{position:absolute;inset:0;background:#d5d2ce;border-radius:99px;cursor:pointer;transition:.2s}.track:after{content:"";position:absolute;width:19px;height:19px;left:3px;top:3px;background:white;border-radius:50%;box-shadow:0 2px 5px #0002;transition:.2s}.switch input:checked+.track{background:var(--mb-accent,#7468e8)}.switch input:checked+.track:after{transform:translateX(20px)}.action-row button{font-weight:800}.secondary,.danger{border:1px solid #d7d2cd;border-radius:10px;padding:9px 13px;background:#fff;color:#333;cursor:pointer;font-size:11px}.danger{background:#30344a;color:#fff;border-color:#30344a}.confirm{display:flex;gap:6px}.about{display:flex;align-items:center;gap:16px;background:linear-gradient(120deg,#fffdfb,#f1efff)}.logo.large{width:56px;height:56px;border-radius:18px;font-size:31px;flex:0 0 auto}.about p{margin:7px 0}.signout{display:flex;align-items:center;justify-content:space-between;gap:15px}.signout p{margin:5px 0 0}@media(max-width:600px){.settings-page{padding:14px}.hero{padding:21px}.hero h1{font-size:32px}.hero-orb{width:78px;height:78px}.field,.action-row{align-items:flex-start;flex-direction:column}.segmented,.accent-list,.confirm{align-self:stretch}.segmented button{flex:1}.about{align-items:flex-start}.signout{align-items:flex-start;flex-direction:column}}`}</style>
  </main>;
}

function Toggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="field"><div><strong>{title}</strong><small>{description}</small></div><label className="switch"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/><span className="track"/></label></div>;
}
