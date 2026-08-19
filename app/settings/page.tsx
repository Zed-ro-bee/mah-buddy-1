"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const KEY = "mah-buddy-prefs";
type Settings = { dark: boolean; voice: boolean; notifications: boolean; memory: boolean; instructions: string };
const defaults: Settings = { dark: false, voice: true, notifications: true, memory: true, instructions: "" };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    try { setSettings({ ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }); } catch {}
    if (supabase) supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next); localStorage.setItem(KEY, JSON.stringify(next)); setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); window.location.href = "/"; }

  return <main className={`settings-page ${settings.dark ? "settings-dark" : ""}`}>
    <header className="settings-header"><a href="/" className="settings-back">←</a><div><div className="settings-brand">✦ Mah Buddy</div><h1>Settings</h1></div>{saved && <span className="settings-saved">✓ Saved</span>}</header>
    <div className="settings-grid">
      <section className="settings-card"><h2>Account</h2><p>Manage your Mah Buddy account.</p><div className="account-box"><span className="account-avatar">M</span><div><strong>{email || "Mah Buddy account"}</strong><small>{email ? "Signed in" : "Account details"}</small></div></div></section>
      <section className="settings-card"><h2>Appearance</h2><p>Make Mah Buddy feel comfortable to use.</p><label className="settings-row"><div><strong>Dark mode</strong><small>Use a darker interface.</small></div><input type="checkbox" checked={settings.dark} onChange={e => update({ dark: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Voice & Text-to-Speech</h2><p>Control spoken responses and voice features.</p><label className="settings-row"><div><strong>Voice responses</strong><small>Allow Mah Buddy to speak responses.</small></div><input type="checkbox" checked={settings.voice} onChange={e => update({ voice: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Notifications</h2><p>Choose whether app notifications are enabled.</p><label className="settings-row"><div><strong>Notifications</strong><small>Enable helpful Mah Buddy notifications.</small></div><input type="checkbox" checked={settings.notifications} onChange={e => update({ notifications: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Privacy & Security</h2><p>Control personalization and local memory.</p><label className="settings-row"><div><strong>Memory</strong><small>Allow Mah Buddy to use saved preferences.</small></div><input type="checkbox" checked={settings.memory} onChange={e => update({ memory: e.target.checked })}/></label></section>
      <section className="settings-card settings-wide"><h2>AI Preferences</h2><p>Tell Mah Buddy how you want it to help you.</p><textarea value={settings.instructions} onChange={e => update({ instructions: e.target.value })} placeholder="Example: Explain difficult topics simply and use examples when helpful." /><small>Saved on this device and shared with the chat through the same preference store.</small></section>
      <section className="settings-card"><h2>About</h2><p>Mah Buddy is your AI study companion.</p><div className="settings-version">Mah Buddy · v1.0</div></section>
      <section className="settings-card danger"><h2>Account actions</h2><p>Sign out of this Mah Buddy account.</p><button onClick={signOut}>Sign out</button></section>
    </div>
    <style jsx>{`*{box-sizing:border-box}.settings-page{min-height:100vh;padding:28px;max-width:1100px;margin:auto;background:#f7f7fb;color:#17171c;font-family:Inter,system-ui,sans-serif}.settings-dark{background:#101116;color:#f4f4f7}.settings-header{display:flex;align-items:center;gap:15px;margin-bottom:28px}.settings-back{width:40px;height:40px;border-radius:12px;background:#e9e9ef;display:grid;place-items:center;text-decoration:none;color:inherit;font-size:22px}.settings-brand{font-weight:800;font-size:13px;opacity:.65}.settings-header h1{margin:3px 0 0;font-size:30px}.settings-saved{margin-left:auto;font-size:13px;font-weight:700}.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.settings-card{background:#fff;border:1px solid #e5e5eb;border-radius:18px;padding:20px;box-shadow:0 8px 30px #00000008}.settings-dark .settings-card{background:#191a20;border-color:#2d2e36}.settings-card h2{font-size:17px;margin:0 0 5px}.settings-card p{font-size:12px;opacity:.55;margin:0 0 16px}.settings-wide{grid-column:1/-1}.settings-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding-top:14px;border-top:1px solid #eeeef2;cursor:pointer}.settings-dark .settings-row{border-color:#30313a}.settings-row strong,.settings-row small,.account-box strong,.account-box small{display:block}.settings-row small,.account-box small{font-size:11px;opacity:.5;margin-top:3px}.settings-row input{width:42px;height:23px;accent-color:#6554e8}.account-box{display:flex;align-items:center;gap:12px;padding:12px;background:#f1f0f6;border-radius:12px}.settings-dark .account-box{background:#24252d}.account-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#dcd8ff;color:#5040c9;font-weight:800}.settings-card textarea{width:100%;min-height:105px;resize:vertical;border:1px solid #dddde5;border-radius:12px;padding:12px;background:transparent;color:inherit;font:inherit;outline:none}.settings-card>small{display:block;font-size:10px;opacity:.45;margin-top:8px}.settings-version{font-size:12px;opacity:.55}.danger button{border:0;border-radius:10px;padding:10px 15px;background:#df4f61;color:#fff;font-weight:700;cursor:pointer}@media(max-width:700px){.settings-page{padding:18px}.settings-grid{grid-template-columns:1fr}.settings-wide{grid-column:auto}.settings-header h1{font-size:25px}}`}</style>
  </main>;
}
