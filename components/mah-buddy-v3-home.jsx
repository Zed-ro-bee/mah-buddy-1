"use client";
import { useEffect, useRef, useState } from "react";

const SYSTEM = "You are Mah Buddy, the AI assistant of the Mah Buddy app. Be helpful, natural and direct. Use clear everyday English. Explain difficult ideas simply and give examples when useful.";

function Mark({ size = 34 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Mah Buddy" role="img"><defs><linearGradient id="mbg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b7cff"/><stop offset="1" stopColor="#c35cff"/></linearGradient></defs><rect x="2" y="2" width="44" height="44" rx="15" fill="url(#mbg2)"/><path d="M13 31V17.5c0-2 2.6-3 4.1-1.5L24 22.8l6.9-6.8c1.5-1.5 4.1-.5 4.1 1.5V31" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="34" r="2" fill="white"/><circle cx="24" cy="34" r="2" fill="white"/><circle cx="32" cy="34" r="2" fill="white"/></svg>;
}

function Icon({ name, size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    send: <><path d="M4 12 20 5l-5 14-3-6-8-1Z"/></>,
    mic: <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    history: <><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M12 8v4l3 2"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9.4 6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3L18 6l1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z"/></>
  };
  return <svg {...p}>{paths[name] || paths.spark}</svg>;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    if (file.type.startsWith("text/") || ["application/json", "text/markdown"].includes(file.type)) reader.readAsText(file);
    else reader.readAsDataURL(file);
  });
}

function HistoryDrawer({ history, onSelect, onNew, onClose, onSettings }) {
  return <div className="mb-history-overlay" onClick={onClose}><aside className="mb-history" onClick={e => e.stopPropagation()}><div className="mb-history-head"><strong>Chat history</strong><button className="mb-icon-btn" onClick={onClose}><Icon name="close"/></button></div><button className="mb-new-chat" onClick={onNew}><Icon name="plus" size={18}/> New chat</button><div className="mb-history-list">{history.length === 0 ? <p className="mb-history-empty">Your conversations will appear here.</p> : history.map(h => <button className="mb-history-item" key={h.id} onClick={() => onSelect(h.id)}><Icon name="history" size={17}/><span>{h.title || "New conversation"}<small>{new Date(h.updatedAt).toLocaleDateString()}</small></span></button>)}</div><button className="mb-settings-nav" onClick={onSettings}><Icon name="settings" size={18}/><span>Settings</span><small>Preferences & appearance</small></button></aside></div>;
}

function SettingsPanel({ theme, onToggleTheme, onClose }) {
  const [voice, setVoice] = useState(true);
  const [enter, setEnter] = useState(true);
  useEffect(() => { setVoice(localStorage.getItem("mb-voice") !== "false"); setEnter(localStorage.getItem("mb-enter") !== "false"); }, []);
  const toggle = (key, setter, value) => { setter(value); localStorage.setItem(key, value ? "true" : "false"); };
  return <div className="mb-settings-overlay" onClick={onClose}><section className="mb-settings" onClick={e => e.stopPropagation()}><header><div><span className="mb-settings-eyebrow">MAH BUDDY</span><h2>Settings</h2><p>Make Mah Buddy feel exactly right for you.</p></div><button className="mb-icon-btn" onClick={onClose}><Icon name="close"/></button></header><div className="mb-settings-section"><h3>Appearance</h3><div className="mb-setting-card"><div className="mb-setting-icon"><Icon name={theme === "dark" ? "moon" : "sun"}/></div><div className="mb-setting-copy"><strong>Theme</strong><span>{theme === "dark" ? "Dark mode" : "Light mode"}</span></div><button className="mb-theme-switch" onClick={onToggleTheme} aria-label="Toggle theme"><span className={theme === "dark" ? "on" : ""}/></button></div></div><div className="mb-settings-section"><h3>Conversation</h3><div className="mb-setting-card"><div className="mb-setting-icon"><Icon name="mic"/></div><div className="mb-setting-copy"><strong>Voice input</strong><span>Use your microphone in chat</span></div><button className="mb-theme-switch" onClick={() => toggle("mb-voice", setVoice, !voice)}><span className={voice ? "on" : ""}/></button></div><div className="mb-setting-card"><div className="mb-setting-icon"><Icon name="send"/></div><div className="mb-setting-copy"><strong>Enter to send</strong><span>Press Enter to send messages</span></div><button className="mb-theme-switch" onClick={() => toggle("mb-enter", setEnter, !enter)}><span className={enter ? "on" : ""}/></button></div></div><div className="mb-settings-footer"><Mark size={30}/><span>Mah Buddy • Your intelligent study companion</span></div></section></div>;
}

export default function MahBuddyV3Home() {
  const [intro, setIntro] = useState(true);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [theme, setTheme] = useState("light");
  const [toast, setToast] = useState("");
  const recognition = useRef(null);
  const fileRef = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 700);
    try {
      const saved = JSON.parse(localStorage.getItem("mah-buddy-history") || "[]");
      setHistory(saved);
      const id = localStorage.getItem("mah-buddy-current");
      const active = saved.find(x => x.id === id) || saved[0];
      if (active) { setCurrentId(active.id); setMessages(active.messages || []); }
      const savedTheme = (localStorage.getItem("mb-theme") || "Light").toLowerCase();
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } catch {}
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentId) {
      setHistory(prev => {
        const updated = prev.map(h => h.id === currentId ? { ...h, messages, updatedAt: Date.now(), title: h.title !== "New conversation" ? h.title : (messages.find(m => m.role === "user")?.content || "New conversation").slice(0, 42) } : h);
        localStorage.setItem("mah-buddy-history", JSON.stringify(updated));
        return updated;
      });
    }
    localStorage.setItem("mah-buddy-current", currentId || "");
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, currentId]);

  function note(text) { setToast(text); setTimeout(() => setToast(""), 1800); }
  function newChat() { const id = crypto.randomUUID(); const item = { id, title: "New conversation", messages: [], updatedAt: Date.now() }; setHistory(h => [item, ...h]); setCurrentId(id); setMessages([]); setInput(""); setAttachment(null); setDrawer(false); }
  function selectChat(id) { const item = history.find(h => h.id === id); if (!item) return; setCurrentId(id); setMessages(item.messages || []); setAttachment(null); setDrawer(false); }
  function toggleTheme() { const value = theme === "dark" ? "light" : "dark"; setTheme(value); localStorage.setItem("mb-theme", value === "dark" ? "Dark" : "Light"); document.documentElement.dataset.theme = value; }

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { note("Please choose a file smaller than 6 MB."); return; }
    try { const data = await readFile(file); setAttachment({ name: file.name, type: file.type || "application/octet-stream", data, size: file.size }); }
    catch { note("I couldn't read that file."); }
  }

  async function send(value = input) {
    const text = String(value || "").trim();
    if ((!text && !attachment) || busy) return;
    let id = currentId;
    if (!id) {
      id = crypto.randomUUID();
      setCurrentId(id);
      setHistory(h => [{ id, title: (text || attachment?.name || "New conversation").slice(0, 42), messages: [], updatedAt: Date.now() }, ...h]);
    }
    const user = { role: "user", content: text || `Please analyze the attached file: ${attachment.name}`, ...(attachment ? { attachment: { name: attachment.name, type: attachment.type, data: attachment.data } } : {}) };
    setInput(""); setAttachment(null); setBusy(true);
    const next = [...messages, user];
    setMessages(next);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-30), customInstructions: SYSTEM, memory: "Use the current conversation as context." }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to respond.");
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "I'm here. What would you like to work on?" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: `I couldn't respond right now. ${error.message || "Please try again."}` }]);
    } finally { setBusy(false); }
  }

  function mic() {
    if (localStorage.getItem("mb-voice") === "false") { note("Voice input is turned off in Settings."); return; }
    if (listening) { recognition.current?.stop(); setListening(false); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { note("Voice input isn't supported here."); return; }
    const instance = new Recognition();
    recognition.current = instance;
    instance.lang = "en-GB";
    instance.onresult = event => { setInput(event.results[0]?.[0]?.transcript || ""); setListening(false); };
    instance.onend = () => setListening(false);
    instance.onerror = () => setListening(false);
    instance.start();
    setListening(true);
  }

  return <>
    {intro && <div className="mb-intro"><div className="mb-intro-inner"><div className="mb-intro-mark"><Mark size={90}/></div><div className="mb-intro-name">Mah Buddy</div></div></div>}
    <div className="mb-shell"><div className="mb-home">
      <header className="mb-header"><button className="mb-icon-btn" onClick={() => setDrawer(true)} aria-label="Chat history"><Icon name="menu"/></button><div className="mb-brand"><Mark size={32}/><strong>Mah Buddy</strong></div><button className="mb-icon-btn" onClick={() => setSettings(true)} aria-label="Settings"><Icon name="settings"/></button></header>
      <main className="mb-content">
        {messages.length === 0 ? <div className="mb-hero"><div className="mb-hero-mark"><Mark size={78}/></div><span className="mb-kicker">YOUR STUDY COMPANION</span><h1>What can we work on?</h1><p>Ask anything, understand difficult ideas, or attach a file for Mah Buddy to work with.</p><div className="mb-prompts"><button onClick={() => send("Explain a difficult topic to me simply.")}><Icon name="spark"/><strong>Explain something</strong><span>Make a difficult idea clear</span></button><button onClick={() => fileRef.current?.click()}><Icon name="plus"/><strong>Attach a file</strong><span>Images, PDFs, text and more</span></button><button onClick={() => send("Help me create a study plan for today.")}><Icon name="history"/><strong>Study plan</strong><span>Turn a goal into steps</span></button></div></div> : <div className="mb-chat">{messages.map((message, index) => <div className={`mb-msg ${message.role}`} key={index}>{message.role === "assistant" && <Mark size={30}/>}<div className="mb-msg-body"><span className="mb-msg-label">{message.role === "assistant" ? "Mah Buddy" : "You"}</span>{message.attachment && <div className="mb-attachment-card"><span>📎</span><div><strong>{message.attachment.name}</strong><small>{message.attachment.type || "File"}</small></div></div>}<p>{message.content}</p></div></div>)}{busy && <div className="mb-msg assistant"><Mark size={30}/><div className="mb-msg-body"><span className="mb-msg-label">Mah Buddy</span><div className="mb-thinking"><i/><i/><i/></div></div></div>}<div ref={bottom}/></div>}
      </main>
      <div className="mb-composer-area"><input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.html,audio/*,video/*" onChange={chooseFile}/>{attachment && <div className="mb-attachment-preview"><span>📎</span><div><strong>{attachment.name}</strong><small>{Math.max(1, Math.round(attachment.size / 1024))} KB · ready to attach</small></div><button onClick={() => setAttachment(null)}><Icon name="close" size={16}/></button></div>}<div className={listening ? "mb-composer listening" : "mb-composer"}><button className="mb-composer-btn" onClick={() => fileRef.current?.click()} aria-label="Attach file"><Icon name="plus"/></button><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && localStorage.getItem("mb-enter") !== "false") { e.preventDefault(); send(); } }} placeholder="Message Mah Buddy…" rows={1}/>{!input.trim() && <button className={listening ? "mb-composer-btn active" : "mb-composer-btn"} onClick={mic} aria-label="Voice input"><Icon name="mic"/></button>}{(input.trim() || attachment) && <button className="mb-send" onClick={() => send()} disabled={busy} aria-label="Send message"><Icon name="send" size={18}/></button>}</div><small>Mah Buddy can make mistakes. Check important information.</small></div>
    </div></div>
    {drawer && <HistoryDrawer history={history} onSelect={selectChat} onNew={newChat} onClose={() => setDrawer(false)} onSettings={() => { setDrawer(false); setSettings(true); }}/>} {settings && <SettingsPanel theme={theme} onToggleTheme={toggleTheme} onClose={() => setSettings(false)}/>} {toast && <div className="mb-toast">{toast}</div>}
  </>;
}
