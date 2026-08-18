"use client";
import { FormEvent, useEffect, useState } from "react";
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
  const [listening, setListening] = useState(false);
  const [speech, setSpeech] = useState(true);
  const [mode, setMode] = useState<Mode>("chat");

  async function sendMessage(event?: FormEvent, textOverride?: string) {
    event?.preventDefault();
    const raw = (textOverride ?? input).trim();
    if (!raw || loading) return;
    const selected = modes.find((item) => item.id === mode);
    const text = mode === "chat" || mode === "conversation" ? raw : `${selected?.prompt ?? ""}${raw}`;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: raw }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, { role: "user", content: text }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mah Buddy could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: data.text }]);
      // Spoken replies are deliberately limited to Conversation mode.
      if (mode === "conversation" && speech && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices();
        const britishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb")) || voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.lang = "en-GB";
        if (britishVoice) utterance.voice = britishVoice;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "I couldn't answer that right now." }]);
    } finally { setLoading(false); }
  }

  function newChat() { setMode("chat"); setInput(""); window.speechSynthesis?.cancel(); setMessages([{ role: "assistant", content: "Hey! I'm Mah Buddy 👋 What are we learning today?" }]); }
  function chooseMode(nextMode: Mode) { if (nextMode !== "conversation") window.speechSynthesis?.cancel(); setMode(nextMode); const item = modes.find((entry) => entry.id === nextMode); setInput(nextMode === "chat" || nextMode === "conversation" ? "" : item?.prompt ?? ""); }
  function voice() {
    if (mode !== "conversation") { setMode("conversation"); }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input is not supported by this browser."); return; }
    const recognition = new SpeechRecognition(); recognition.lang = "en-GB"; recognition.interimResults = false;
    recognition.onstart = () => setListening(true); recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => sendMessage(undefined, event.results[0][0].transcript); recognition.start();
  }
  useEffect(() => { window.speechSynthesis?.getVoices(); return () => window.speechSynthesis?.cancel(); }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="sidebar-top"><button className="brand" onClick={newChat}><span className="brand-mark">MB</span><span>Mah Buddy</span></button><button className="new-chat" onClick={newChat}><span>＋</span> New chat</button><div className="section-label">Study modes</div><nav>{modes.slice(1).map((item) => <button key={item.id} className={mode === item.id ? "nav-item active" : "nav-item"} onClick={() => chooseMode(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav></div><div className="sidebar-bottom"><button className="side-control" onClick={() => setSpeech((value) => !value)}><span>{speech ? "◉" : "○"}</span> Voice {speech ? "on" : "off"}</button><div className="profile"><span className="profile-dot">M</span><span><strong>Mah Buddy</strong><small>AI Study Companion</small></span></div></div></aside>
      <main className="chat-app"><header className="mobile-header"><button className="mobile-brand" onClick={newChat}><span className="brand-mark">MB</span> Mah Buddy</button><button className="mobile-action" onClick={newChat}>＋</button></header>
        <div className="chat-scroll"><div className="conversation"><div className="conversation-title"><span className="title-dot">✦</span><span>{mode === "chat" ? "Mah Buddy" : modes.find((item) => item.id === mode)?.label}</span></div>{messages.map((message, index) => <div key={index} className={`row ${message.role}`}>{message.role === "assistant" && <div className="avatar">MB</div>}<div className="bubble-wrap"><div className="message-author">{message.role === "assistant" ? "Mah Buddy" : "You"}</div><div className="message-content">{message.content}</div></div></div>)}{loading && <div className="row assistant"><div className="avatar">MB</div><div className="bubble-wrap"><div className="message-author">Mah Buddy</div><div className="message-content thinking"><i></i><i></i><i></i></div></div></div>}</div></div>
        <div className="composer-area"><form className="composer" onSubmit={sendMessage}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === "conversation" ? "Speak to Mah Buddy…" : mode === "chat" ? "Message Mah Buddy…" : `Enter a topic for ${modes.find((item) => item.id === mode)?.label.toLowerCase()}…`} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><div className="composer-actions"><button className={`icon-btn mic-btn ${listening ? "listening" : ""}`} type="button" onClick={voice} disabled={loading} aria-label={listening ? "Stop listening" : "Voice conversation"}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v3.5M8.5 20.5h7"/></svg></button><button className="send-btn" disabled={loading || !input.trim()} type="submit">↑</button></div></form><div className="composer-note">Mah Buddy can make mistakes. Check important information.</div></div>
      </main>
    </div>
  );
}
