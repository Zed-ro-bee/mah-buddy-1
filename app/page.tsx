"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Mah Buddy 👋 What are you studying today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((current) => [...current, { role: "assistant", content: data.text }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: error instanceof Error ? error.message : "I couldn't answer that right now." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brand">Mah <span>Buddy</span></div>
        <nav className="nav">
          <button>💬 AI Chat</button>
          <button>📝 Notes</button>
          <button>🧠 Flashcards</button>
          <button>🎯 Quizzes</button>
          <button>📊 Progress</button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar"><h1>AI Study Buddy</h1></header>
        <section className="content">
          <div className="hero">
            <h2>Learn smarter with Mah Buddy.</h2>
            <p>Ask questions, understand difficult topics, revise, and practise.</p>
          </div>

          <div className="cards">
            <div className="card"><strong>📚 Explain a topic</strong><span>Get simple, step-by-step explanations.</span></div>
            <div className="card"><strong>🧠 Make flashcards</strong><span>Turn what you're learning into revision cards.</span></div>
            <div className="card"><strong>🎯 Quiz me</strong><span>Test your understanding with practice questions.</span></div>
          </div>

          <section className="chat">
            <div className="messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>{message.content}</div>
              ))}
              {loading && <div className="message assistant">Mah Buddy is thinking…</div>}
            </div>
            <form className="composer" onSubmit={sendMessage}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Mah Buddy anything about your studies…"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button disabled={loading || !input.trim()} type="submit">Send</button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
