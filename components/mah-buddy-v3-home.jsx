"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const SYSTEM = "You are Mah Buddy, the AI assistant of the Mah Buddy app. Be friendly, intelligent, professional, and direct. Match answer length to the question and the user's saved learning level. Write in clear everyday English. Format answers like a polished chat assistant: use short paragraphs separated by blank lines, and start a new paragraph when the idea changes. Use headings, bold text, lists, tables, and equations when they improve clarity. Avoid dense walls of text. Keep study difficulty separate from language level.";
const PROFILE_KEY = "mah-buddy-profile";
const PREFS_KEY = "mah-buddy-prefs";
const CHAT_PALETTES = {
  forest:{bg:"#141916",surface:"#1D2922",raised:"#263B30",accent:"#9BE8F4",muted:"#A0ACA3"},
  ocean:{bg:"#101923",surface:"#182A39",raised:"#213D50",accent:"#71D8FF",muted:"#9CB5C6"},
  violet:{bg:"#191523",surface:"#282038",raised:"#3B2D52",accent:"#C6A5FF",muted:"#B0A6C2"},
  rose:{bg:"#211719",surface:"#332225",raised:"#4A2E35",accent:"#FF9EBC",muted:"#C6A6AD"},
  amber:{bg:"#211D14",surface:"#332B1D",raised:"#4A3B25",accent:"#FFD080",muted:"#C1B49A"},
  midnight:{bg:"#111827",surface:"#1C273B",raised:"#293A56",accent:"#A5BFFF",muted:"#A5B0C5"}
};
function applyChatPreferences(prefs = {}) {
  const palette = CHAT_PALETTES[prefs.palette] || CHAT_PALETTES.forest;
  const accent = /^#[0-9a-fA-F]{6}$/.test(prefs.accent || "") ? prefs.accent : palette.accent;
  const root = document.documentElement;
  root.dataset.theme = "dark";
  root.dataset.mbTheme = "dark";
  root.style.colorScheme = "dark";
  root.style.setProperty("--mb-ink",palette.bg);
  root.style.setProperty("--mb-ink-raised",palette.surface);
  root.style.setProperty("--mb-surface",palette.surface);
  root.style.setProperty("--mb-surface-raised",palette.raised);
  root.style.setProperty("--mb-violet",accent);
  root.style.setProperty("--mb-violet-bright",accent);
  root.style.setProperty("--mb-cyan",accent);
  root.style.setProperty("--mb-accent",accent);
  root.style.setProperty("--mb-cloud","#F0F4F0");
  root.style.setProperty("--mb-muted",palette.muted);
  root.style.setProperty("--mb-border",accent+"35");
  root.style.setProperty("--mb-border-strong",accent+"70");
  root.style.setProperty("--mb-focus","0 0 0 3px "+accent+"45");
  root.classList.toggle("mb-reduced-motion",!!prefs.reducedMotion);
}

function readStoredProfile() {
  try {
    const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch { return {}; }
}

function readStoredDifficulty() {
  try {
    const value = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    return ["Easy", "Normal", "Hard"].includes(value?.difficulty) ? value.difficulty : "Normal";
  } catch { return "Medium"; }
}

function InlineMarkdown({ text }) {
  const pattern = /(\\[[^\\]]+\\]\\((?:\\/[^\\s)]*|https?:\\/\\/[^\\s)]+)\\)|\\*\\*[^*]+\\*\\*|(?<!\\*)\\*[^*\\n]+\\*(?!\\*)|\\`[^\\`\\n]+\\`|\\$[^$\\n]+\\$|\\\\\\([^\\n]+?\\\\\\))/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    const link = part.match(/^\\[([^\\]]+)\\]\\(([^)]+)\\)$/);\n    if (link) { const href = link[2].trim(); const internal = /^\\/(quiz|flashcards|study|library|profile|settings)(?:[/?#]|$)/.test(href) || href === "/"; const external = /^https?:\\/\\//i.test(href); if (internal) return <a key={index} href={href} style={{color:"var(--mb-accent, #9BE8F4)",textDecoration:"underline",textUnderlineOffset:3,fontWeight:600}}>{link[1]}</a>; if (external) return <a key={index} href={href} target="_blank" rel="noopener noreferrer" style={{color:"var(--mb-accent, #9BE8F4)",textDecoration:"underline",textUnderlineOffset:3,fontWeight:600}}>{link[1]}</a>; return <span key={index}>{link[1]}</span>; }\n    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("\`") && part.endsWith("\`")) return <code className="mb-md-inline-code" key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("$") && part.endsWith("$")) return <span className="mb-md-math" key={index}>{part.slice(1, -1)}</span>;
    if (part.startsWith("\\(") && part.endsWith("\\)")) return <span className="mb-md-math" key={index}>{part.slice(2, -2)}</span>;
    return <span key={index}>{part}</span>;
  });
}

function MarkdownAnswer({ content }) {
  const lines = String(content || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;
  const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const isTableDivider = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^\s*\`\`\`/.test(line)) {
      const language = line.trim().slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !/^\s*\`\`\`/.test(lines[i])) body.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(<pre className="mb-md-code-block" key={blocks.length}><code data-language={language || undefined}>{body.join("\n")}</code></pre>);
      continue;
    }
    if (/^\s*\$\$\s*$/.test(line)) {
      const body = [];
      i++;
      while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) body.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(<div className="mb-md-display-math" key={blocks.length}>{body.join(" ")}</div>);
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = ("h" + level);
      blocks.push(<Tag className="mb-md-heading" key={blocks.length}><InlineMarkdown text={heading[2].replace(/\s+#+\s*$/, "")}/></Tag>);
      i++; continue;
    }
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      blocks.push(<hr className="mb-md-divider" key={blocks.length}/>); i++; continue;
    }
    if (i + 1 < lines.length && line.includes("|") && isTableDivider(lines[i + 1])) {
      const headers = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(cells(lines[i++]));
      blocks.push(<div className="mb-md-table-wrap" key={blocks.length}><table className="mb-md-table"><thead><tr>{headers.map((cell, n) => <th key={n}><InlineMarkdown text={cell}/></th>)}</tr></thead><tbody>{rows.map((row, ri) => <tr key={ri}>{headers.map((_, ci) => <td key={ci}><InlineMarkdown text={row[ci] || ""}/></td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push(<blockquote className="mb-md-quote" key={blocks.length}>{quote.map((part, n) => <p key={n}><InlineMarkdown text={part}/></p>)}</blockquote>);
      continue;
    }
    if (/^\s*[-*+]\s+(?!\[[ xX]\]\s+)/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+(?!\[[ xX]\]\s+)/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*+]\s+/, ""));
      blocks.push(<ul className="mb-md-list" key={blocks.length}>{items.map((item, n) => <li key={n}><InlineMarkdown text={item}/></li>)}</ul>);
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      blocks.push(<ol className="mb-md-list" key={blocks.length}>{items.map((item, n) => <li key={n}><InlineMarkdown text={item}/></li>)}</ol>);
      continue;
    }
    if (/^\s*[-*]\s+\[[ xX]\]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+\[[ xX]\]\s+/.test(lines[i])) items.push({ done: /\[[xX]\]/.test(lines[i]), text: lines[i++].replace(/^\s*[-*]\s+\[[ xX]\]\s+/, "") });
      blocks.push(<ul className="mb-md-list" key={blocks.length}>{items.map((item, n) => <li key={n}><span aria-hidden="true">{item.done ? "☑ " : "☐ "}</span><InlineMarkdown text={item.text}/></li>)}</ul>);
      continue;
    }
    const paragraph = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^\s{0,3}(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s?|\`\`\`|\$\$\s*$|(?:---+|\*\*\*+|___+)\s*$)/.test(lines[i]) && !(i + 1 < lines.length && lines[i].includes("|") && isTableDivider(lines[i + 1]))) paragraph.push(lines[i++].trim());
    blocks.push(<p className="mb-md-paragraph" key={blocks.length}>{paragraph.map((part, n) => <span key={n}>{n > 0 ? " " : ""}<InlineMarkdown text={part}/></span>)}</p>);
  }
  return <div className="mb-md-content">{blocks}</div>;
}

function Mark({ size = 30 }) { return <img className="mb-logo" src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy" draggable="false" />; }

function Icon({ name, size = 20 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    send: <><path d="M4 12 20 5l-5 14-3-6-8-1Z"/></>,
    mic: <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.9L4 20l1.4-4.1A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h8M8 14h5"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/></>,
    library: <><path d="M4 5h16M4 10h16M4 15h16"/><path d="M6 3v18M18 3v18"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>,
    volume: <><path d="M4 10v4h4l5 4V6l-5 4Z"/><path d="M17 9a5 5 0 0 1 0 6M19 5a9 9 0 0 1 0 14"/></>,
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
  return <div className="mb-history-overlay" onClick={onClose}><aside className="mb-history" onClick={e => e.stopPropagation()}>
    <div className="mb-history-head"><div className="mb-drawer-brand"><span className="mb-drawer-brand-mark"><Mark size={38}/></span><div><strong>Mah Buddy</strong><small>Your study companion</small></div></div><button className="mb-icon-btn" onClick={onClose} aria-label="Close navigation"><Icon name="close"/></button></div>
    <button className="mb-drawer-new-chat" onClick={onNew}><Icon name="plus" size={18}/> New chat</button>
    <div className="mb-history-section-title">WORKSPACE</div>
    <nav className="mb-side-navigation" aria-label="Main navigation">
      <a className="mb-side-link active" href="/"><Icon name="message" size={18}/> AI Assistance</a>
      <a className="mb-side-link" href="/study"><Icon name="book" size={18}/> Study</a>
      <a className="mb-side-link" href="/library"><Icon name="library" size={18}/> Library & Resources</a>
    </nav>
    <div className="mb-history-section-title">YOUR ACCOUNT</div>
    <nav className="mb-side-navigation mb-side-account" aria-label="Account navigation">
      <a className="mb-side-link" href="/profile"><Icon name="user" size={18}/> Profile</a>
      <a className="mb-side-link" href="/settings"><Icon name="settings" size={18}/> Settings</a>
    </nav>
    <div className="mb-history-section-title">RECENT CHATS</div>
    <div className="mb-history-list">{history.length === 0 ? <p className="mb-history-empty">Your conversations will appear here.</p> : history.map(h => <button className="mb-history-item" key={h.id} onClick={() => onSelect(h.id)}><Icon name="history" size={17}/><span>{h.title || "New conversation"}<small>{new Date(h.updatedAt).toLocaleDateString()}</small></span></button>)}</div>
    <div className="mb-drawer-legal"><a href="/privacy-policy">Privacy Policy</a><span>·</span><a href="/terms-of-service">Terms of Service</a></div>
  </aside></div>;
}

function SettingsPanel({ onClose }) {
  const [voice, setVoice] = useState(true);
  const [enter, setEnter] = useState(true);
  useEffect(() => { setVoice(localStorage.getItem("mb-voice") !== "false"); setEnter(localStorage.getItem("mb-enter") !== "false"); }, []);
  const toggle = (key, setter, value) => {
    setter(value);
    localStorage.setItem(key, value ? "true" : "false");
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
      if (key === "mb-voice") prefs.voice = value;
      if (key === "mb-enter") prefs.enterToSend = value;
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      window.dispatchEvent(new CustomEvent("mah-buddy-preferences-changed"));
      if (supabase) {
        supabase.auth.getUser().then(({data}) => {
          if (data.user) return supabase.auth.updateUser({data:{mah_buddy_preferences:prefs}});
        }).catch(() => {});
      }
    } catch {}
  };
  return <div className="mb-settings-overlay" onClick={onClose}><section className="mb-settings" onClick={e => e.stopPropagation()}><header><div><span className="mb-settings-eyebrow">MAH BUDDY</span><h2>Settings</h2><p>Make Mah Buddy feel exactly right for you.</p></div><button className="mb-icon-btn" onClick={onClose}><Icon name="close"/></button></header><div className="mb-settings-section"><h3>Conversation</h3><div className="mb-setting-card"><div className="mb-setting-icon"><Icon name="mic"/></div><div className="mb-setting-copy"><strong>Voice input</strong><span>Use your microphone in chat</span></div><button className="mb-theme-switch" onClick={() => toggle("mb-voice", setVoice, !voice)}><span className={voice ? "on" : ""}/></button></div><div className="mb-setting-card"><div className="mb-setting-icon"><Icon name="send"/></div><div className="mb-setting-copy"><strong>Enter to send</strong><span>Press Enter to send messages</span></div><button className="mb-theme-switch" onClick={() => toggle("mb-enter", setEnter, !enter)}><span className={enter ? "on" : ""}/></button></div></div><a className="mb-settings-full-link" href="/settings">Open all settings <span aria-hidden="true">→</span></a><div className="mb-settings-footer"><Mark size={30}/><span>Mah Buddy • Your intelligent study companion</span></div></section></div>;
}

export default function MahBuddyV3Home() {
  const [intro, setIntro] = useState(true);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [input, setInput] = useState("");
  const [launchPrompt, setLaunchPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [toast, setToast] = useState("");
  const recognition = useRef(null);
  const fileRef = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 700);
    try {
      const params = new URLSearchParams(window.location.search);
      const prompt = params.get("prompt");
      const autoStart = params.get("autostart") === "1";
      const saved = JSON.parse(localStorage.getItem("mah-buddy-history") || "[]");
      setHistory(saved);
      if (prompt && autoStart) {
        setCurrentId("");
        setMessages([]);
        setLaunchPrompt(prompt);
      } else {
        const id = localStorage.getItem("mah-buddy-current");
        const active = saved.find(x => x.id === id) || saved[0];
        if (active) { setCurrentId(active.id); setMessages(active.messages || []); }
      }
      // Load the same saved preferences used by the Settings page.
      let prefs = {};
      try { prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch {}
      applyChatPreferences(prefs);
      localStorage.setItem("mb-voice",String(prefs.voice !== false));
      localStorage.setItem("mb-auto-speak",String(!!prefs.autoSpeak));
      localStorage.setItem("mb-enter",String(prefs.enterToSend !== false));
      localStorage.setItem("mb-voice-speed",String(prefs.voiceSpeed || "1"));
      localStorage.setItem("mah-buddy-daily-goal",String(prefs.dailyGoal || "30"));
      localStorage.setItem("mah-buddy-reminders",String(!!prefs.reminders));
      localStorage.setItem("mah-buddy-revision-enabled",String(prefs.revision !== false));
      setTheme("dark");
      if (supabase) {
        supabase.auth.getUser().then(({data}) => {
          const remote = data.user?.user_metadata?.mah_buddy_preferences;
          if (remote && typeof remote === "object") {
            const merged = {...prefs,...remote};
            try { localStorage.setItem(PREFS_KEY,JSON.stringify(merged)); } catch {}
            applyChatPreferences(merged);
            localStorage.setItem("mb-voice",String(merged.voice !== false));
            localStorage.setItem("mb-auto-speak",String(!!merged.autoSpeak));
            localStorage.setItem("mb-enter",String(merged.enterToSend !== false));
            localStorage.setItem("mb-voice-speed",String(merged.voiceSpeed || "1"));
            localStorage.setItem("mah-buddy-daily-goal",String(merged.dailyGoal || "30"));
            localStorage.setItem("mah-buddy-reminders",String(!!merged.reminders));
            localStorage.setItem("mah-buddy-revision-enabled",String(merged.revision !== false));
          }
        }).catch(() => {});
      }
    } catch {}
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const refreshPreferences = () => {
      try {
        const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
        applyChatPreferences(prefs);
        localStorage.setItem("mb-voice",String(prefs.voice !== false));
        localStorage.setItem("mb-auto-speak",String(!!prefs.autoSpeak));
        localStorage.setItem("mb-enter",String(prefs.enterToSend !== false));
        localStorage.setItem("mb-voice-speed",String(prefs.voiceSpeed || "1"));
      } catch {}
    };
    window.addEventListener("mah-buddy-preferences-changed",refreshPreferences);
    window.addEventListener("storage",refreshPreferences);
    return () => {
      window.removeEventListener("mah-buddy-preferences-changed",refreshPreferences);
      window.removeEventListener("storage",refreshPreferences);
    };
  }, []);

  useEffect(() => {
    if (!launchPrompt) return;
    const prompt = launchPrompt;
    setLaunchPrompt("");
    send(prompt);
  }, [launchPrompt]);

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
  function listenTo(text) {
    if (!("speechSynthesis" in window)) { note("Audio playback is not supported here."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text || ""));
    utterance.lang = "en-GB";
    try { utterance.rate = Number(localStorage.getItem("mb-voice-speed") || "1"); } catch { utterance.rate = 1; }
    window.speechSynthesis.speak(utterance);
  }
  async function copyAnswer(text) {
    try { await navigator.clipboard.writeText(String(text || "")); note("Answer copied."); }
    catch { note("Copy isn't available in this browser."); }
  }
  function explainMore(text) { send("Please explain this answer in more detail, using a simple example:\\n\\n" + String(text || "")); }
  function newChat() { const id = crypto.randomUUID(); const item = { id, title: "New conversation", messages: [], updatedAt: Date.now() }; setHistory(h => [item, ...h]); setCurrentId(id); setMessages([]); setInput(""); setAttachment(null); setDrawer(false); }
  function selectChat(id) { const item = history.find(h => h.id === id); if (!item) return; setCurrentId(id); setMessages(item.messages || []); setAttachment(null); setDrawer(false); }

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
      // Read the current profile and study preferences directly here so the AI request
      // always contains the user's learning level and selected difficulty.
      const profile = readStoredProfile();
      const difficulty = readStoredDifficulty();
      const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; } })();
      const styleGuide = prefs.answerStyle === "Simple" ? "Prefer simple, plain-language explanations and short steps." : prefs.answerStyle === "Detailed" ? "Give thorough explanations with useful context and examples when relevant." : "Use a balanced level of detail, with clear explanations and examples when helpful.";
      const readLearningJSON = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value == null ? fallback : value; } catch { return fallback; } };
      const progress = prefs.memory === false ? [] : readLearningJSON("mah-buddy-progress", []);
      const quizHistory = prefs.memory === false ? [] : readLearningJSON("mah-buddy-quiz-history", []);
      const flashcardHistory = prefs.memory === false ? [] : readLearningJSON("mah-buddy-flashcard-history", []);
      const progressSummary = Array.isArray(progress) ? progress.slice(-8).map(item => {
        const score = Number(item?.score) || 0, total = Number(item?.total) || 0;
        return { topic: String(item?.topic || "General study").slice(0, 100), score, total, percentage: total ? Math.round(score / total * 100) : null, date: item?.date || null };
      }) : [];
      const learningGuide = prefs.memory === false
        ? "Memory is disabled. Use only the current message and conversation context. Do not use stored profile, learning history, or saved memories."
        : "Act as the connected Mah Buddy learning brain. Use the saved profile and recent learning activity below when relevant. Treat quiz results as evidence for what to explain or practise next; do not claim to know information absent from this context. Recent quiz results: " + JSON.stringify(progressSummary) + ". Recent quiz question history (for avoiding repetition): " + JSON.stringify(Array.isArray(quizHistory) ? quizHistory.slice(-25) : []).slice(0, 3500) + ". Recent flashcard question history (for revision continuity): " + JSON.stringify(Array.isArray(flashcardHistory) ? flashcardHistory.slice(-25) : []).slice(0, 2500) + ". Suggest a connected follow-up such as an explanation, focused quiz, or flashcards only when useful.";
      let accessToken = "";
      if (supabase && prefs.memory !== false) {
        try { const { data } = await supabase.auth.getSession(); accessToken = data.session?.access_token || ""; } catch {}
      }
      let savedMemories = [];
      if (accessToken) {
        try {
          const memoryResponse = await fetch("/api/memory", { headers: { Authorization: "Bearer " + accessToken } });
          if (memoryResponse.ok) { const memoryData = await memoryResponse.json(); savedMemories = (memoryData.memories || []).map(item => item.content).filter(Boolean); }
        } catch {}
      }
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-30), customInstructions: SYSTEM + " " + styleGuide, memory: learningGuide, profile: prefs.memory === false ? {} : profile, savedMemories: prefs.memory === false ? [] : savedMemories, difficulty }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to respond.");
      const answer = data.text || "I'm here. What would you like to work on?";
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      if (accessToken && prefs.memory !== false) {
        void fetch("/api/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
          body: JSON.stringify({ action: "extract", messages: [...next.slice(-8), { role: "assistant", content: answer }] })
        }).catch(() => {});
      }
      if (localStorage.getItem("mb-auto-speak") === "true" && "speechSynthesis" in window) listenTo(answer);
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
      <header className="mb-header"><button className="mb-icon-btn" onClick={() => setDrawer(true)} aria-label="Open navigation"><Icon name="menu"/></button><div className="mb-brand"><Mark size={32}/><strong>Mah Buddy</strong></div><button className="mb-icon-btn" onClick={() => setSettings(true)} aria-label="Settings"><Icon name="settings"/></button></header>
      <main className="mb-content">
        {messages.length === 0 ? <div className="mb-hero"><span className="mb-hero-eyebrow">YOUR PERSONAL AI COMPANION</span><h1>What can I help you with?</h1><h2>What can I help you with?</h2><p>Ask anything, explore a topic, or work through your studies with me.</p></div> : <div className="mb-chat">{messages.map((message, index) => <div className={`mb-msg ${message.role}`} key={index}>{message.role === "assistant" && <Mark size={30}/>}<div className="mb-msg-body"><span className="mb-msg-label">{message.role === "assistant" ? "Mah Buddy" : "You"}</span>{message.attachment && <div className="mb-attachment-card"><span>📎</span><div><strong>{message.attachment.name}</strong><small>{message.attachment.type || "File"}</small></div></div>}{message.role === "assistant" ? <div className="mb-answer-card"><MarkdownAnswer content={message.content}/></div> : <div className="mb-user-bubble"><p>{message.content}</p></div>}{message.role === "assistant" && <div className="mb-answer-actions"><button onClick={() => copyAnswer(message.content)} aria-label="Copy answer"><Icon name="copy" size={15}/> Copy</button><button onClick={() => listenTo(message.content)} aria-label="Listen to answer"><Icon name="volume" size={15}/> Listen</button><button onClick={() => explainMore(message.content)} disabled={busy} aria-label="Explain more"><Icon name="spark" size={15}/> Explain more</button></div>}</div></div>)}{busy && <div className="mb-msg assistant"><Mark size={30}/><div className="mb-msg-body"><span className="mb-msg-label">Mah Buddy</span><div className="mb-thinking"><i/><i/><i/></div></div></div>}<div ref={bottom}/></div>}
      </main>
      <div className="mb-composer-area"><input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.html,audio/*,video/*" onChange={chooseFile}/>{attachment && <div className="mb-attachment-preview"><span>📎</span><div><strong>{attachment.name}</strong><small>{Math.max(1, Math.round(attachment.size / 1024))} KB · ready to attach</small></div><button onClick={() => setAttachment(null)}><Icon name="close" size={16}/></button></div>}<div className={listening ? "mb-composer listening" : "mb-composer"}><button className="mb-composer-btn" onClick={() => fileRef.current?.click()} aria-label="Attach file"><Icon name="plus"/></button><textarea value={input} onChange={e => { setInput(e.target.value); e.currentTarget.style.height = "auto"; e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 150) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && localStorage.getItem("mb-enter") !== "false") { e.preventDefault(); send(); } }} aria-label="Message Mah Buddy" placeholder="Message Mah Buddy…" rows={1}/>{!input.trim() && <button className={listening ? "mb-composer-btn active" : "mb-composer-btn"} onClick={mic} aria-label="Voice input"><Icon name="mic"/></button>}{(input.trim() || attachment) && <button className="mb-send" onClick={() => send()} disabled={busy} aria-label="Send message"><Icon name="send" size={18}/></button>}</div><small>Mah Buddy can make mistakes. Check important information.</small></div>
      <nav className="mb-mobile-nav mb-nav-four" aria-label="Main navigation"><a className="active" href="/" aria-current="page"><Icon name="message" size={19}/><span>Chat</span></a><a href="/study"><Icon name="book" size={19}/><span>Study</span></a><a href="/library"><Icon name="library" size={19}/><span>Library</span></a><a href="/profile"><Icon name="user" size={19}/><span>Profile</span></a></nav>
    </div></div>
    {drawer && <HistoryDrawer history={history} onSelect={selectChat} onNew={newChat} onClose={() => setDrawer(false)} onSettings={() => { setDrawer(false); setSettings(true); }}/>} {settings && <SettingsPanel onClose={() => setSettings(false)}/>} {toast && <div className="mb-toast">{toast}</div>}
  </>;
}
