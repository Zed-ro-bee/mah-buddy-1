"use client";
import { useEffect, useRef, useState } from "react";

const PURPLE = "#6D4AFF";
const PURPLE_2 = "#A83BDF";
const INK = "#20202A";
const MUTED = "#6D6B78";
const BORDER = "#E8E5EE";

function Logo({ size = 38 }) {
  return <img src="/mah-buddy-logo.svg" alt="Mah Buddy" width={size} height={size} style={{ objectFit: "contain" }} />;
}

function Icon({ children, active = false }) {
  return <span className={active ? "mb-icon mb-icon-active" : "mb-icon"}>{children}</span>;
}

function AppButton({ children, onClick, primary = false, className = "" }) {
  return <button className={`${primary ? "mb-primary" : "mb-button"} ${className}`} onClick={onClick}>{children}</button>;
}

function Flashcards({ onClose, dark }) {
  const [number, setNumber] = useState(5);
  const [difficulty, setDifficulty] = useState("Hard");
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const makeCards = () => {
    const subject = topic.trim() || "Life";
    const next = Array.from({ length: number }, (_, i) => ({
      question: `${subject}: key study question ${i + 1}`,
      answer: `Mah Buddy explanation for ${subject}, card ${i + 1}. Review the main idea, then connect it to an example.`,
    }));
    setCards(next);
    setIndex(0);
    setRevealed(false);
  };

  const card = cards?.[index];
  const pageClass = dark ? "mb-tool mb-tool-dark" : "mb-tool";

  return <div className={pageClass}>
    <div className="mb-tool-topbar">
      <button className="mb-round" onClick={cards ? () => setCards(null) : onClose} aria-label="Back">‹</button>
      <div className="mb-tool-brand"><Logo size={29} /><strong>Mah Buddy</strong></div>
      <button className="mb-round" onClick={onClose} aria-label="Close">×</button>
    </div>

    {!cards ? <>
      <div className="mb-flash-settings">
        <div><span>FLASHCARD SETTINGS</span><strong>Number of cards</strong></div>
        <select value={number} onChange={e => setNumber(Number(e.target.value))} aria-label="Number of cards">
          {[5, 10, 15, 20].map(n => <option key={n}>{n}</option>)}
        </select>
        <div className="mb-setting-divider" />
        <div><span>DIFFICULTY</span><strong>Study level</strong></div>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="Difficulty">
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <span className="mb-sliders">☷</span>
      </div>

      <div className="mb-tool-heading">
        <span>AI TOOLS / FLASHCARDS</span>
        <h1>Flashcards</h1>
        <h2>Engaging flashcards</h2>
        <p>Effective studying sessions, built around the topic you choose.</p>
      </div>

      <div className="mb-topic-row">
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic, e.g. Biology" />
        <AppButton primary onClick={makeCards}>Create cards</AppButton>
      </div>

      <div className="mb-preview-card">
        <strong>Ready to study?</strong>
        <span>Choose a topic above and Mah Buddy will build your {difficulty.toLowerCase()} study deck.</span>
        <small>{number} cards · {difficulty}</small>
      </div>
    </> : <>
      <div className="mb-study-head">
        <div><span>FLASHCARDS</span><strong>{topic.trim() || "Life"}</strong></div>
        <div className="mb-progress">{index + 1} / {cards.length}</div>
      </div>
      <button className={`mb-card-face ${revealed ? "revealed" : ""}`} onClick={() => setRevealed(v => !v)}>
        <span className="mb-card-label">{revealed ? "ANSWER" : "QUESTION"}</span>
        <strong>{revealed ? card.answer : card.question}</strong>
        <small>{revealed ? "Tap to see the question" : "Tap to reveal answer"}</small>
      </button>
      <div className="mb-card-nav">
        <AppButton onClick={() => { setIndex(Math.max(0, index - 1)); setRevealed(false); }}>Previous</AppButton>
        <strong>{index + 1} / {cards.length}</strong>
        {index < cards.length - 1 ? <AppButton primary onClick={() => { setIndex(index + 1); setRevealed(false); }}>Next</AppButton> : <AppButton primary onClick={onClose}>Finish</AppButton>}
      </div>
    </>}
    <div className="mb-tool-bottom"><span>⌂<small>Home</small></span><span className="active">▦<small>Tools</small></span><span>◷<small>History</small></span><span>◯<small>Profile</small></span></div>
  </div>;
}

function Quiz({ onClose, dark }) {
  const [q, setQ] = useState(0);
  const [choice, setChoice] = useState(null);
  const questions = ["What would you like to understand better?", "Which statement best explains the topic?", "Which example fits the idea?", "What is the key takeaway?", "How would you explain it to a friend?"];
  const options = ["The first explanation", "A different interpretation", "The most accurate explanation", "None of these"];
  return <div className={dark ? "mb-tool mb-tool-dark" : "mb-tool"}>
    <div className="mb-tool-topbar"><button className="mb-round" onClick={onClose}>‹</button><div className="mb-tool-brand"><Logo size={29}/><strong>Mah Buddy</strong></div><button className="mb-round" onClick={onClose}>×</button></div>
    <div className="mb-quiz-wrap"><span className="mb-eyebrow">AI TOOLS / QUIZ</span><h1>Quick quiz</h1><p>One question at a time, with a calm study flow.</p><div className="mb-quiz-progress">Question {q + 1} of {questions.length}</div><h2>{questions[q]}</h2>{options.map((option, i) => <button key={option} className={`mb-option ${choice === i ? "selected" : ""}`} disabled={choice !== null} onClick={() => setChoice(i)}>{option}</button>)}{choice !== null && <AppButton primary onClick={() => { if (q === questions.length - 1) onClose(); else { setQ(q + 1); setChoice(null); } }}>{q === questions.length - 1 ? "Finish quiz" : "Next question"}</AppButton>}</div>
  </div>;
}

function Tools({ close, send, dark }) {
  const [screen, setScreen] = useState("home");
  if (screen === "flashcards") return <Flashcards onClose={close} dark={dark} />;
  if (screen === "quiz") return <Quiz onClose={close} dark={dark} />;
  return <div className={dark ? "mb-tool mb-tool-dark" : "mb-tool"}>
    <div className="mb-tool-topbar"><button className="mb-round" onClick={close}>‹</button><div className="mb-tool-brand"><Logo size={29}/><strong>Mah Buddy</strong></div><button className="mb-round" onClick={close}>×</button></div>
    <div className="mb-tools-wrap"><span className="mb-eyebrow">MAH BUDDY / AI TOOLS</span><h1>Study tools</h1><p>Everything you need for a focused learning session.</p><div className="mb-tool-grid"><button onClick={() => send("Explain a difficult topic clearly, using simple language and an example.")}><Icon active>✎</Icon><strong>Explain</strong><small>Clear walkthroughs</small></button><button onClick={() => setScreen("flashcards")}><Icon active>▤</Icon><strong>Flashcards</strong><small>Build a study deck</small></button><button onClick={() => setScreen("quiz")}><Icon active>?</Icon><strong>Quiz</strong><small>Test what you know</small></button><button onClick={() => send("Help me make a realistic study plan.")}><Icon active>✓</Icon><strong>Study plan</strong><small>Plan your next session</small></button></div></div>
  </div>;
}

export default function MahBuddyHome() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [dark, setDark] = useState(false);
  const [tools, setTools] = useState(false);
  const [listen, setListen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState("");
  const bottom = useRef(null);
  const fileRef = useRef(null);
  const rec = useRef(null);

  useEffect(() => { try { setMessages(JSON.parse(localStorage.getItem("mah-buddy-chat") || "[]")); setDark(JSON.parse(localStorage.getItem("mah-buddy-prefs") || "{}").theme === "dark"); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("mah-buddy-chat", JSON.stringify(messages)); localStorage.setItem("mah-buddy-prefs", JSON.stringify({ theme: dark ? "dark" : "light" })); } catch {} bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, dark]);
  function note(text) { setToast(text); window.clearTimeout(note.timer); note.timer = window.setTimeout(() => setToast(""), 2200); }
  async function send(value = input) {
    const v = String(value || "").trim();
    if ((!v && !file) || busy) return;
    setInput(""); setBusy(true);
    const user = { role: "user", content: v || "Please analyse this attachment.", attachment: file || undefined };
    const next = [...messages, user]; setMessages(next); setFile(null);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-30), customInstructions: "You are Mah Buddy, the AI assistant of the Mah Buddy app. Answer naturally, directly and helpfully. For quizzes, ask one question at a time. Keep responses age-appropriate and accurate.", memory: "Use the current conversation as context." }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.details || "Mah Buddy could not respond.");
      setMessages(m => [...m, { role: "assistant", content: data.text || "I'm here. What would you like help with?" }]);
      if (voiceMode) speak(data.text || "");
    } catch (error) { setMessages(m => [...m, { role: "assistant", content: `I couldn't respond right now. ${error.message || "Please try again."}` }]); }
    finally { setBusy(false); }
  }
  function speak(text) { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-GB"; utterance.rate = .96; window.speechSynthesis.speak(utterance); }
  function mic() {
    if (listen) { rec.current?.stop(); setListen(false); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return note("Voice input is not supported here");
    const recognition = new Recognition(); rec.current = recognition; recognition.lang = "en-GB";
    recognition.onresult = event => setInput(x => `${x}${x ? " " : ""}${event.results[0][0].transcript}`); recognition.onend = () => setListen(false); recognition.start(); setListen(true);
  }
  function attach(event) { const picked = event.target.files?.[0]; if (!picked) return; if (picked.size > 7 * 1024 * 1024) return note("Please choose a file smaller than 7 MB"); const reader = new FileReader(); reader.onload = () => setFile({ name: picked.name, type: picked.type || "application/octet-stream", data: String(reader.result || "") }); reader.readAsDataURL(picked); event.target.value = ""; }
  function clearChat() { setMessages([]); localStorage.removeItem("mah-buddy-chat"); note("New chat started"); }

  const suggestions = [["Explain a difficult topic", "with a simple example"], ["Help me study", "make a realistic study plan"], ["Quiz me", "one question at a time"], ["Solve a problem", "show the working clearly"]];

  return <div className={`mb-app ${dark ? "dark" : ""}`}>
    {toast && <div className="mb-toast">{toast}</div>}
    {sidebar && <aside className="mb-sidebar"><div className="mb-sidebar-brand"><Logo size={38}/><strong>Mah Buddy</strong></div><button onClick={clearChat}>＋ <span>New chat</span></button><button onClick={() => note("Chat search is coming to saved conversations.")}>⌕ <span>Search chats</span></button><button onClick={() => setTools(true)}>✦ <span>AI Tools</span></button><div className="mb-side-spacer"/><button onClick={() => setDark(v => !v)}>◐ <span>{dark ? "Light mode" : "Dark mode"}</span></button><a href="/settings">⚙ <span>Settings</span></a><a href="/profile">◯ <span>Profile</span></a></aside>}
    <main className="mb-main">
      <header className="mb-header"><button className="mb-round" onClick={() => setSidebar(v => !v)} aria-label="Menu">☰</button><Logo size={31}/><strong>Mah Buddy</strong><span className="mb-online"><i/> Online</span><button className="mb-round mb-plus" onClick={clearChat}>＋</button></header>
      <section className="mb-chat-area">
        {!messages.length ? <div className="mb-empty"><div className="mb-welcome"><div className="mb-welcome-logo"><Logo size={48}/></div><span>MAH BUDDY</span><h1>Hello!</h1><h2>What are we learning today?</h2><p>Ask anything, study a topic, practise with a quiz, or just talk it through.</p><button className="mb-listen" onClick={() => speak("Hello! I'm Mah Buddy. What are we learning today?")}>🔊 Listen</button></div><div className="mb-suggestions">{suggestions.map(([title, sub]) => <button key={title} onClick={() => send(title)}><strong>{title}</strong><small>{sub}</small></button>)}</div></div> : <div className="mb-messages">{messages.map((message, index) => <div key={index} className={`mb-message ${message.role === "user" ? "user" : "assistant"}`}>{message.role !== "user" && <Logo size={30}/>}<div className="mb-bubble">{message.attachment && <small className="mb-attachment">📎 {message.attachment.name}</small>}<div>{message.content}</div>{message.role !== "user" && <button className="mb-listen-text" onClick={() => speak(message.content)}>🔊 Listen</button>}</div></div>)}{busy && <div className="mb-message assistant"><Logo size={30}/><div className="mb-bubble mb-thinking"><span/> <span/> <span/> Thinking…</div></div>}<div ref={bottom}/></div>}
      </section>
      <div className="mb-composer-wrap">{file && <div className="mb-file">📎 {file.name}<button onClick={() => setFile(null)}>×</button></div>}<div className="mb-composer"><input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.html" onChange={attach}/><button className="mb-composer-icon" onClick={() => fileRef.current?.click()} aria-label="Attach">＋</button><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Message Mah Buddy…" rows={1}/><button className={`mb-composer-icon ${listen ? "selected" : ""}`} onClick={mic} aria-label="Voice input">◉</button><button className={`mb-composer-icon ${voiceMode ? "selected" : ""}`} onClick={() => { setVoiceMode(v => !v); note(!voiceMode ? "Conversation mode on" : "Conversation mode off"); }} aria-label="Conversation mode">◌</button><button className="mb-send" disabled={(!input.trim() && !file) || busy} onClick={() => send()}>↑</button></div><div className="mb-disclaimer">Mah Buddy may make mistakes. Check important information.</div></div>
      <nav className="mb-bottom-nav"><button onClick={() => setSidebar(v => !v)}><Icon>⌂</Icon><small>Home</small></button><button onClick={() => setTools(true)}><Icon active>▦</Icon><small>Tools</small></button><button onClick={() => note("Your recent chats are saved on this device.")}><Icon>◷</Icon><small>History</small></button><a href="/profile"><Icon>◯</Icon><small>Profile</small></a></nav>
      {tools && <div className="mb-overlay"><Tools close={() => setTools(false)} send={send} dark={dark}/></div>}
    </main>
    <style>{`
      *{box-sizing:border-box}.mb-app{height:100dvh;display:flex;background:#f7f6f9;color:${INK};font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}.mb-app.dark{background:#17151f;color:#f7f5ff}.mb-sidebar{width:252px;flex:0 0 252px;background:#fff;border-right:1px solid ${BORDER};padding:18px 14px;display:flex;flex-direction:column;gap:4px}.dark .mb-sidebar{background:#211f2b;border-color:#383444}.mb-sidebar-brand{display:flex;align-items:center;gap:10px;padding:5px 8px 20px;font-size:17px}.mb-sidebar button,.mb-sidebar a{border:0;background:transparent;color:inherit;text-decoration:none;text-align:left;padding:12px 12px;border-radius:12px;font:600 13px inherit;cursor:pointer}.mb-sidebar button:hover,.mb-sidebar a:hover{background:#f2effc}.dark .mb-sidebar button:hover,.dark .mb-sidebar a:hover{background:#302b48}.mb-sidebar button:first-of-type{background:#f0ecff;color:#5638dc}.mb-side-spacer{flex:1}.mb-main{min-width:0;flex:1;display:flex;flex-direction:column;position:relative}.mb-header{height:64px;flex:0 0 64px;display:flex;align-items:center;gap:10px;padding:0 16px;background:rgba(255,255,255,.92);border-bottom:1px solid ${BORDER};backdrop-filter:blur(16px);z-index:5}.dark .mb-header{background:rgba(33,31,43,.94);border-color:#383444}.mb-header strong{font-size:15px}.mb-online{margin-left:auto;font-size:11px;color:#3c9a68;display:flex;gap:5px;align-items:center}.mb-online i{width:7px;height:7px;border-radius:50%;background:#43b878}.mb-round{width:38px;height:38px;border:1px solid ${BORDER};border-radius:12px;background:#fff;color:${INK};font-size:20px;cursor:pointer;display:grid;place-items:center}.dark .mb-round{background:#292733;border-color:#403c4c;color:#fff}.mb-plus{margin-left:4px}.mb-chat-area{flex:1;min-height:0;overflow:auto;padding:24px 16px 8px}.mb-empty{max-width:760px;margin:0 auto;min-height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center}.mb-welcome{width:min(100%,680px);padding:30px;border:1px solid ${BORDER};border-radius:28px;background:linear-gradient(135deg,#eee9ff,#e8f8fb 55%,#f8e7f1);box-shadow:0 18px 50px rgba(40,30,80,.08);text-align:left}.mb-welcome-logo{width:72px;height:72px;border-radius:22px;background:rgba(255,255,255,.75);display:grid;place-items:center;margin-bottom:18px}.mb-welcome>span,.mb-eyebrow{font-size:10px;letter-spacing:.2em;font-weight:800;color:#745de2}.mb-welcome h1{font:500 clamp(38px,7vw,58px)/1 Georgia,serif;margin:8px 0 0;color:#262231}.mb-welcome h2{font:500 clamp(25px,5vw,40px)/1.08 Georgia,serif;margin:0 0 12px;color:#262231}.mb-welcome p{margin:0;color:#555260;font-size:14px;line-height:1.6;max-width:520px}.mb-listen{margin-top:20px;border:1px solid rgba(85,70,160,.2);background:rgba(255,255,255,.72);border-radius:999px;padding:10px 16px;color:#4c3aa9;font-weight:700;cursor:pointer}.mb-suggestions{width:min(100%,680px);display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px}.mb-suggestions button{background:#fff;border:1px solid ${BORDER};border-radius:16px;padding:14px;text-align:left;color:${INK};cursor:pointer}.dark .mb-suggestions button{background:#211f2b;border-color:#383444;color:#fff}.mb-suggestions strong,.mb-suggestions small{display:block}.mb-suggestions strong{font-size:13px}.mb-suggestions small{font-size:11px;color:${MUTED};margin-top:4px}.mb-messages{max-width:820px;margin:0 auto;padding:12px 0 20px}.mb-message{display:flex;gap:9px;margin:0 0 18px;align-items:flex-start}.mb-message.user{justify-content:flex-end}.mb-bubble{max-width:min(78%,680px);padding:13px 16px;border-radius:18px;background:#fff;border:1px solid ${BORDER};color:${INK};line-height:1.65;font-size:14px;white-space:pre-wrap;box-shadow:0 5px 20px rgba(30,25,50,.04)}.dark .mb-bubble{background:#211f2b;border-color:#383444;color:#f7f5ff}.mb-message.user .mb-bubble{background:linear-gradient(135deg,${PURPLE},${PURPLE_2});color:#fff;border:0;border-bottom-right-radius:5px}.mb-message.assistant .mb-bubble{border-top-left-radius:5px}.mb-listen-text{border:0;background:transparent;color:#6c60a5;padding:7px 0 0;font-size:11px;cursor:pointer}.mb-attachment{display:block;margin-bottom:6px;opacity:.75}.mb-thinking{display:flex;align-items:center;gap:5px;color:${MUTED}}.mb-thinking span{width:6px;height:6px;border-radius:50%;background:#8a7ee9;animation:mbPulse 1s infinite}.mb-thinking span:nth-child(2){animation-delay:.15s}.mb-thinking span:nth-child(3){animation-delay:.3s}@keyframes mbPulse{50%{opacity:.25;transform:translateY(-2px)}}.mb-composer-wrap{padding:8px 16px 12px;background:linear-gradient(transparent,#f7f6f9 25%)}.dark .mb-composer-wrap{background:linear-gradient(transparent,#17151f 25%)}.mb-composer{max-width:820px;margin:0 auto;display:flex;align-items:flex-end;gap:6px;padding:8px;border:1px solid #d9d5e0;border-radius:22px;background:#fff;box-shadow:0 10px 30px rgba(30,25,50,.07)}.dark .mb-composer{background:#211f2b;border-color:#403c4c}.mb-composer textarea{flex:1;min-height:40px;max-height:130px;border:0;outline:0;resize:none;background:transparent;color:inherit;font:14px inherit;padding:10px 4px}.mb-composer textarea::placeholder{color:#9996a2}.mb-composer-icon,.mb-send{width:40px;height:40px;border-radius:13px;border:0;background:#f3f1f6;color:#5d5968;cursor:pointer;font-size:19px}.dark .mb-composer-icon{background:#302d39;color:#fff}.mb-composer-icon.selected{background:#eee9ff;color:#5e45e0}.mb-send{background:linear-gradient(135deg,${PURPLE},${PURPLE_2});color:#fff;font-weight:800}.mb-send:disabled{opacity:.28;cursor:default}.mb-file{max-width:820px;margin:0 auto 6px;padding:7px 10px;border:1px solid ${BORDER};border-radius:12px;background:#fff;font-size:11px}.dark .mb-file{background:#211f2b;border-color:#383444}.mb-file button{float:right;border:0;background:transparent;cursor:pointer}.mb-disclaimer{text-align:center;color:#a29eaa;font-size:9px;margin-top:7px}.mb-bottom-nav{display:none}.mb-overlay{position:absolute;inset:64px 0 0;background:rgba(245,243,249,.96);z-index:20;overflow:auto}.dark .mb-overlay{background:rgba(23,21,31,.97)}.mb-tool{min-height:100%;padding:0 18px 28px;color:${INK};background:#f8f7fb}.mb-tool-dark{background:#17151f;color:#f7f5ff}.mb-tool-topbar{height:64px;display:flex;align-items:center;justify-content:space-between;max-width:860px;margin:0 auto;border-bottom:1px solid ${BORDER}}.mb-tool-dark .mb-tool-topbar{border-color:#383444}.mb-tool-brand{display:flex;align-items:center;gap:8px;font-size:15px}.mb-tools-wrap,.mb-quiz-wrap,.mb-tool-heading,.mb-topic-row,.mb-study-head,.mb-card-face,.mb-card-nav,.mb-flash-settings,.mb-preview-card{max-width:860px;margin-left:auto;margin-right:auto}.mb-tools-wrap{padding-top:44px}.mb-tools-wrap h1,.mb-tool-heading h1,.mb-quiz-wrap h1{font:500 clamp(40px,7vw,64px)/.95 Georgia,serif;margin:8px 0}.mb-tools-wrap p,.mb-tool-heading p,.mb-quiz-wrap>p{color:${MUTED};line-height:1.6}.mb-tool-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}.mb-tool-grid button{border:1px solid ${BORDER};background:#fff;border-radius:20px;padding:18px;text-align:left;cursor:pointer;color:${INK};min-height:150px}.mb-tool-dark .mb-tool-grid button{background:#211f2b;border-color:#383444;color:#fff}.mb-tool-grid strong,.mb-tool-grid small{display:block}.mb-tool-grid strong{margin-top:20px}.mb-tool-grid small{color:${MUTED};margin-top:5px}.mb-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:#f1eef9;color:#5f4ae0;font-size:20px}.mb-icon-active{background:#eee9ff}.mb-flash-settings{margin-top:18px;padding:12px 14px;border-radius:17px;background:linear-gradient(90deg,#6e50f1,#b03cdd);color:#fff;display:flex;align-items:center;gap:10px;box-shadow:0 12px 28px rgba(103,71,225,.18)}.mb-flash-settings div{display:flex;flex-direction:column;gap:2px}.mb-flash-settings span{font-size:8px;letter-spacing:.12em;opacity:.8}.mb-flash-settings strong{font-size:12px}.mb-flash-settings select{border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 9px;font-weight:700}.mb-flash-settings option{color:#222}.mb-setting-divider{height:34px;width:1px;background:rgba(255,255,255,.3);margin:0 4px}.mb-sliders{margin-left:auto;font-size:22px;opacity:.9}.mb-tool-heading{padding:26px 0 16px}.mb-tool-heading h2{font:700 18px Georgia,serif;margin:0}.mb-tool-heading p{margin-top:6px}.mb-topic-row{display:flex;gap:10px}.mb-topic-row input{flex:1;border:1px solid #d8d4df;border-radius:13px;padding:13px 14px;background:#fff;color:${INK};font:14px inherit;outline:none}.mb-primary,.mb-button{border-radius:13px;padding:12px 18px;border:1px solid ${BORDER};font-weight:800;cursor:pointer}.mb-primary{border:0;background:linear-gradient(135deg,${PURPLE},${PURPLE_2});color:#fff}.mb-button{background:#fff;color:${INK}.dark .mb-button,.mb-tool-dark .mb-button{background:#292733;color:#fff;border-color:#403c4c}.mb-preview-card{margin-top:18px;border-radius:24px;min-height:260px;padding:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,#e4dcff,#f6d2e8);color:#272233}.mb-preview-card strong{font:700 31px Georgia,serif}.mb-preview-card span{max-width:500px;margin-top:12px;line-height:1.5}.mb-preview-card small{margin-top:18px;font-weight:800;opacity:.7}.mb-study-head{display:flex;justify-content:space-between;align-items:center;padding:26px 0 14px}.mb-study-head span,.mb-card-label{display:block;font-size:9px;letter-spacing:.16em;color:#7b68dc;font-weight:800}.mb-study-head strong{display:block;font:700 22px Georgia,serif;margin-top:3px}.mb-progress{font-weight:800}.mb-card-face{width:100%;min-height:360px;border:0;border-radius:26px;background:linear-gradient(135deg,#e1d9ff,#f5cbe5);color:#242130;padding:42px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer}.mb-card-face.revealed{background:linear-gradient(135deg,#d7eff2,#e8dcff)}.mb-card-face strong{font:700 clamp(26px,5vw,42px)/1.1 Georgia,serif;max-width:720px;margin:18px 0}.mb-card-face small{font-size:11px;letter-spacing:.06em}.mb-card-nav{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-top:14px}.mb-card-nav .mb-primary:last-child,.mb-card-nav .mb-button:last-child{justify-self:end}.mb-quiz-wrap{padding:44px 0}.mb-quiz-progress{display:inline-block;margin:24px 0 12px;padding:7px 10px;border-radius:999px;background:#eee9ff;color:#5f49d7;font-size:11px;font-weight:800}.mb-quiz-wrap h2{font:700 28px/1.2 Georgia,serif;max-width:650px}.mb-option{display:block;width:100%;max-width:700px;text-align:left;padding:15px 16px;border:1px solid ${BORDER};border-radius:14px;background:#fff;color:${INK};margin:9px 0;cursor:pointer}.mb-tool-dark .mb-option{background:#211f2b;border-color:#383444;color:#fff}.mb-option.selected{border-color:#7256ee;background:#eee9ff}.mb-quiz-wrap>.mb-primary{margin-top:10px}.mb-tool-bottom{max-width:860px;margin:24px auto 0;border-top:1px solid ${BORDER};padding-top:13px;display:flex;justify-content:space-around;color:#777481}.mb-tool-bottom span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:18px}.mb-tool-bottom small{font-size:9px}.mb-tool-bottom .active{color:#6448df}.mb-toast{position:fixed;top:78px;left:50%;transform:translateX(-50%);z-index:100;background:#22212a;color:#fff;padding:10px 15px;border-radius:999px;font-size:11px;font-weight:800;box-shadow:0 8px 30px rgba(0,0,0,.2)}
      @media(max-width:767px){.mb-app{display:block}.mb-sidebar{display:none}.mb-header{height:58px;flex-basis:58px;padding:0 12px}.mb-chat-area{padding:16px 12px 4px}.mb-empty{justify-content:center;padding-bottom:16px}.mb-welcome{padding:22px;border-radius:23px}.mb-welcome-logo{width:60px;height:60px}.mb-suggestions{grid-template-columns:1fr 1fr}.mb-suggestions button{padding:12px}.mb-composer-wrap{padding:6px 10px 58px}.mb-composer{border-radius:20px}.mb-bottom-nav{position:fixed;display:flex;left:0;right:0;bottom:0;height:52px;background:rgba(255,255,255,.96);border-top:1px solid ${BORDER};z-index:10;justify-content:space-around}.dark .mb-bottom-nav{background:rgba(33,31,43,.97);border-color:#383444}.mb-bottom-nav button,.mb-bottom-nav a{flex:1;border:0;background:transparent;color:inherit;text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font:inherit}.mb-bottom-nav small{font-size:9px}.mb-overlay{inset:58px 0 0}.mb-tool{padding:0 12px 20px}.mb-flash-settings{margin-top:10px;gap:7px;overflow:auto}.mb-flash-settings div:nth-of-type(2){display:none}.mb-flash-settings strong{font-size:10px}.mb-flash-settings select{padding:7px}.mb-tool-heading{padding:22px 2px 12px}.mb-tool-heading h1,.mb-tools-wrap h1,.mb-quiz-wrap h1{font-size:43px}.mb-topic-row{display:grid;grid-template-columns:1fr}.mb-topic-row .mb-primary{width:100%}.mb-preview-card{min-height:240px}.mb-tool-grid{grid-template-columns:1fr 1fr}.mb-tool-grid button{min-height:130px}.mb-card-face{min-height:330px;padding:24px}.mb-card-nav{grid-template-columns:1fr auto 1fr}.mb-tools-wrap,.mb-quiz-wrap{padding-top:30px}.mb-tools-wrap p{font-size:13px}.mb-bubble{max-width:88%;font-size:13px}.mb-online{display:none}.mb-plus{margin-left:auto}.mb-sidebar-brand{display:none}}
    `}</style>
  </div>;
}
