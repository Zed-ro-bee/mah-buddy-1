"use client";
import { FormEvent, useEffect, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "chat" | "explain" | "flashcards" | "quiz";

const modes: { id: Mode; label: string; icon: string; prompt: string }[] = [
  { id: "chat", label: "AI Chat", icon: "💬", prompt: "" },
  { id: "explain", label: "Explain", icon: "📚", prompt: "Explain this topic simply, step by step, with an example: " },
  { id: "flashcards", label: "Flashcards", icon: "🧠", prompt: "Turn this topic into 5 useful study flashcards with questions and answers: " },
  { id: "quiz", label: "Quiz Me", icon: "🎯", prompt: "Quiz me on this topic. Ask one question at a time and wait for my answer before continuing: " },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Mah Buddy 👋 What are we learning today?" },
  ]);
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
    const text = mode === "chat" ? raw : `${selected?.prompt ?? ""}${raw}`;
    setInput("");
    const next = [...messages, { role: "user" as const, content: raw }];
    setMessages(next);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: text }] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mah Buddy could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: data.text }]);

      if (speech && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: error instanceof Error ? error.message : "I couldn't answer that right now." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    const item = modes.find((entry) => entry.id === nextMode);
    if (nextMode !== "chat") setInput(item?.prompt ?? "");
    else setInput("");
  }

  function voice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported by this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      sendMessage(undefined, text);
    };
    recognition.start();
  }

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brand">Mah <span>Buddy</span></div>
        <nav className="nav">
          {modes.map((item) => (
            <button key={item.id} className={mode === item.id ? "active" : ""} onClick={() => chooseMode(item.id)}>
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={() => setMessages([{ role: "assistant", content: "Fresh chat started 👋 What are we learning?" }])}>✨ New chat</button>
        </nav>
        <div className="sidebar-note">Your study space<br /><span>Learn • Practise • Improve</span></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">MAH BUDDY</div><h1>AI Study Companion</h1></div>
          <button className="voice-toggle" onClick={() => setSpeech((value) => !value)}>
            {speech ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        </header>

        <section className="content">
          <div className="hero">
            <div>
              <span className="status">● Ready to learn</span>
              <h2>Learn smarter with Mah Buddy.</h2>
              <p>Ask questions, understand difficult topics, revise, and practise with your AI study companion.</p>
            </div>
            <div className="hero-orb">MB</div>
          </div>

          <div className="cards">
            <button className="card" onClick={() => chooseMode("explain")}><strong>📚 Explain a topic</strong><span>Simple step-by-step explanations.</span></button>
            <button className="card" onClick={() => chooseMode("flashcards")}><strong>🧠 Make flashcards</strong><span>Turn any topic into revision cards.</span></button>
            <button className="card" onClick={() => chooseMode("quiz")}><strong>🎯 Quiz me</strong><span>Practise what you know.</span></button>
          </div>

          <section className="chat">
            <div className="chat-head"><div><strong>{modes.find((item) => item.id === mode)?.icon} {modes.find((item) => item.id === mode)?.label}</strong><span>Mah Buddy is here to help</span></div><button onClick={() => setMessages([{ role: "assistant", content: "Hey again 👋 What should we work on?" }])}>Clear</button></div>
            <div className="messages">
              {messages.map((message, index) => <div key={index} className={`message ${message.role}`}><span className="message-label">{message.role === "assistant" ? "Mah Buddy" : "You"}</span>{message.content}</div>)}
              {loading && <div className="message assistant"><span className="message-label">Mah Buddy</span><span className="dots">Thinking<span>.</span><span>.</span><span>.</span></span></div>}
            </div>
            <form className="composer" onSubmit={sendMessage}>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === "chat" ? "Ask Mah Buddy anything about your studies…" : "Enter a topic or question…"} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
              <button className="mic" type="button" onClick={voice} disabled={loading}>{listening ? "🔴" : "🎙️"}</button>
              <button className="send" disabled={loading || !input.trim()} type="submit">Send ↑</button>
            </form>
            <div className="composer-hint">Press Enter to send • Shift + Enter for a new line</div>
          </section>
        </section>
      </main>
    </div>
  );
}
