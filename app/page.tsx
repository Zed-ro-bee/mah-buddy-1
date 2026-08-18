"use client";
import { FormEvent, useState } from "react";
import AuthGate from "../components/auth-gate";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "chat" | "conversation" | "explain" | "flashcards" | "quiz";
const modes: { id: Mode; label: string; icon: string; prompt: string }[] = [
  { id: "chat", label: "New chat", icon: "＋", prompt: "" },
  { id: "conversation", label: "Conversation", icon: "◉", prompt: "" },
  { id: "explain", label: "Explain", icon: "✦", prompt: "Explain this topic simply, step by step, with an example: " },
  { id: "flashcards", label: "Flashcards", icon: "▤", prompt: "Turn this topic into 5 useful study flashcards with questions and answers: " },
  { id: "quiz", label: "Quiz me", icon: "✓", prompt: "Quiz me on this topic. Ask one question at a time and wait for my answer before continuing: " },
];
export default function Home() { return <AuthGate><MahBuddyChat /></AuthGate>; }
function MahBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hey! I'm Mah Buddy 👋 What are we learning today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const raw = input.trim();
    if (!raw || loading) return;
    const selected = modes.find(item => item.id === mode);
    const text = mode === "chat" || mode === "conversation" ? raw : `${selected?.prompt ?? ""}${raw}`;
    setInput("");
    setMessages(c => [...c, { role: "user", content: raw }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, { role: "user", content: text }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mah Buddy could not respond.");
      setMessages(c => [...c, { role: "assistant", content: data.text }]);
    } catch (error) {
      setMessages(c => [...c, { role: "assistant", content: error instanceof Error ? error.message : "I couldn't answer that right now." }]);
    } finally { setLoading(false); }
  }

  function newChat() { setMode("chat"); setInput(""); setMessages([{ role: "assistant", content: "Hey! I'm Mah Buddy 👋 What are we learning today?" }]); }
  function chooseMode(nextMode: Mode) { setMode(nextMode); const item = modes.find(e => e.id === nextMode); setInput(nextMode === "chat" || nextMode === "conversation" ? "" : item?.prompt ?? ""); }

  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-top"><button className="brand" onClick={newChat}><span className="brand-mark">MB</span><span>Mah Buddy</span></button><button className="new-chat" onClick={newChat}><span>＋</span> New chat</button><div className="section-label">Study modes</div><nav>{modes.slice(1).map(item => <button key={item.id} className={mode === item.id ? "nav-item active" : "nav-item"} onClick={() => chooseMode(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav></div><div className="sidebar-bottom"><div className="profile"><span className="profile-dot">M</span><span><strong>Mah Buddy</strong><small>AI Study Companion</small></span></div></div></aside><main className="chat-app"><header className="mobile-header"><button className="mobile-brand" onClick={newChat}><span className="brand-mark">MB</span> Mah Buddy</button><button className="mobile-action" onClick={newChat}>＋</button></header><div className="chat-scroll"><div className="conversation"><div className="conversation-title"><span className="title-dot">✦</span><span>{mode === "chat" ? "Mah Buddy" : modes.find(item => item.id === mode)?.label}</span></div>{messages.map((message, index) => <div key={index} className={`row ${message.role}`}>{message.role === "assistant" && <div className="avatar">MB</div>}<div className="bubble-wrap"><div className="message-author">{message.role === "assistant" ? "Mah Buddy" : "You"}</div><div className="message-content">{message.content}</div></div></div>)}{loading && <div className="row assistant"><div className="avatar">MB</div><div className="bubble-wrap"><div className="message-author">Mah Buddy</div><div className="message-content thinking"><i></i><i></i><i></i></div></div></div>}</div></div><div className="composer-area"><form className="composer" onSubmit={sendMessage}><textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "conversation" ? "Message Mah Buddy…" : mode === "chat" ? "Message Mah Buddy…" : `Enter a topic for ${modes.find(item => item.id === mode)?.label.toLowerCase()}…`} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} /><div className="composer-actions"><button className="send-btn" disabled={loading || !input.trim()} type="submit">↑</button></div></form><div className="composer-note">Mah Buddy can make mistakes. Check important information.</div></div></main></div>;
}
