"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const KEY = "mah-buddy-settings";

type Settings = { dark: boolean; voice: boolean; notifications: boolean; memory: boolean; instructions: string };
const defaults: Settings = { dark: false, voice: true, notifications: true, memory: true, instructions: "" };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setSettings({ ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }); } catch {}
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next); localStorage.setItem(KEY, JSON.stringify(next)); setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
    if (patch.dark !== undefined) document.documentElement.classList.toggle("dark", next.dark);
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); window.location.href = "/"; }

  return <main className="settings-page">
    <header className="settings-header"><a href="/" className="settings-back">←</a><div><div className="settings-brand">✦ Mah Buddy</div><h1>Settings</h1></div>{saved && <span className="settings-saved">Saved</span>}</header>
    <div className="settings-grid">
      <section className="settings-card"><h2>Account</h2><p>Manage your Mah Buddy account.</p><div className="settings-row"><div><strong>Account</strong><small>Sign-in and account security are managed by Supabase.</small></div></div></section>
      <section className="settings-card"><h2>Appearance</h2><p>Make Mah Buddy feel comfortable to use.</p><label className="settings-row"><div><strong>Dark mode</strong><small>Use a darker interface.</small></div><input type="checkbox" checked={settings.dark} onChange={e => update({ dark: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Voice & Text-to-Speech</h2><p>Control spoken responses and voice features.</p><label className="settings-row"><div><strong>Voice responses</strong><small>Allow Mah Buddy to speak responses.</small></div><input type="checkbox" checked={settings.voice} onChange={e => update({ voice: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Notifications</h2><p>Choose whether app notifications are enabled.</p><label className="settings-row"><div><strong>Notifications</strong><small>Enable helpful Mah Buddy notifications.</small></div><input type="checkbox" checked={settings.notifications} onChange={e => update({ notifications: e.target.checked })}/></label></section>
      <section className="settings-card"><h2>Privacy & Security</h2><p>Control personalization and local memory.</p><label className="settings-row"><div><strong>Memory</strong><small>Allow Mah Buddy to use saved preferences.</small></div><input type="checkbox" checked={settings.memory} onChange={e => update({ memory: e.target.checked })}/></label></section>
      <section className="settings-card settings-wide"><h2>AI Preferences</h2><p>Tell Mah Buddy how you want it to help you.</p><textarea value={settings.instructions} onChange={e => update({ instructions: e.target.value })} placeholder="Example: Explain difficult topics simply and use examples when helpful." /><small>These preferences are saved on this device.</small></section>
      <section className="settings-card"><h2>About</h2><p>Mah Buddy is your AI study companion.</p><div className="settings-version">Mah Buddy · v1.0</div></section>
      <section className="settings-card danger"><h2>Account actions</h2><p>Sign out of this Mah Buddy account.</p><button onClick={signOut}>Sign out</button></section>
    </div>
  </main>;
}
