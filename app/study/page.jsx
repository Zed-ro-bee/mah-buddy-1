"use client";

import { useMemo, useState } from "react";

const tools = [
  { title: "Flashcards", description: "Remember key facts and concepts with a deck made for you.", detail: "REVISE", href: "/flashcards", icon: "cards" },
  { title: "Quizzes", description: "Check your understanding and learn from each answer.", detail: "TEST YOURSELF", href: "/quiz", icon: "quiz" },
  { title: "Study notes", description: "Turn a topic into clear, organised notes you can revisit.", detail: "UNDERSTAND", href: "/study/notes", icon: "notes" },
  { title: "Practice questions", description: "Build confidence with subject-based practice questions.", detail: "GET PRACTICE", href: "/quiz?mode=practice", icon: "practice" },
  { title: "Learn from files", description: "Upload study material and ask Mah Buddy to explain it.", detail: "YOUR MATERIAL", href: "/study/files", icon: "notes" },
  { title: "Study planner", description: "Plan sessions, set study goals and track what you finish.", detail: "STAY ON TRACK", href: "/study/planner", icon: "practice" },
  { title: "Learning progress", description: "Review quiz scores and find topics to practise next.", detail: "SEE YOUR GROWTH", href: "/study/progress", icon: "quiz" },
  { title: "Exam preparation", description: "Start focused revision for JAMB, WAEC or NECO.", detail: "EXAM MODE", href: "/quiz?topic=JAMB%20exam%20preparation", icon: "practice" },
];

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    cards: <><rect x="5" y="4" width="13" height="16" rx="2"/><path d="M9 8h5M9 12h5"/><path d="M19 7v12a2 2 0 0 1-2 2"/></>,
    quiz: <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.3 2.3 4.8-5"/><path d="M9 3.5 10 2h4l1 1.5"/></>,
    notes: <><path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1-1.5Z"/><path d="M14 3.5V8h4M8 12h7M8 16h7"/></>,
    practice: <><path d="M8 4h12v16H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="m9 10 1.5 1.5L13 9M9 15h7"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.6-.9L4 20l1.4-4.1A7.5 7.5 0 1 1 20 11.5Z"/></>,
    library: <><path d="M4 5h16M4 10h16M4 15h16"/><path d="M6 3v18M18 3v18"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  };
  return <svg {...common}>{paths[name] || paths.arrow}</svg>;
}

export default function StudyPage() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => tools.filter(item => (item.title + " " + item.description).toLowerCase().includes(search.toLowerCase().trim())), [search]);

  return <main className="study-hub">
    <header className="hub-header">
      <a href="/" className="hub-back" aria-label="Back to chat">←</a>
      <div className="hub-brand"><span className="brand-dot" /> <strong>Mah Buddy</strong></div>
      <span className="hub-header-label">STUDY</span>
    </header>
    <section className="hub-content">
      <div className="hub-intro">
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <h1>Study, your way.</h1>
        <p>Choose a tool and let’s make your next study session count.</p>
      </div>
      <label className="hub-search">
        <Icon name="search"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a study tool" aria-label="Find a study tool"/>
        {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
      </label>
      <div className="hub-grid">
        {filtered.map((item, index) => <a href={item.href} className="tool-card" key={item.title} style={{"--card-index": index}}>
          <div className="tool-card-top"><span className="tool-icon"><Icon name={item.icon}/></span><span className="tool-arrow"><Icon name="arrow"/></span></div>
          <span className="tool-detail">{item.detail}</span>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </a>)}
      </div>
      {filtered.length === 0 && <div className="hub-empty"><p>No tools match “{search}”.</p><button onClick={() => setSearch("")}>Clear search</button></div>}
      <p className="hub-footnote">Your learning profile helps Mah Buddy adapt each session to you.</p>
    </section>
    <nav className="hub-nav" aria-label="Main navigation">
      <a href="/"><Icon name="message"/><span>Chat</span></a>
      <a href="/study" className="active" aria-current="page"><Icon name="cards"/><span>Study</span></a>
      <a href="/library"><Icon name="library"/><span>Library</span></a>
      <a href="/profile"><Icon name="user"/><span>Profile</span></a>
    </nav>
    <style jsx>{`
      :global(*){box-sizing:border-box}
      .study-hub{min-height:100dvh;background:#141916;color:#F0F4F0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:calc(108px + env(safe-area-inset-bottom))}
      .hub-header{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;min-height:62px;padding:0 max(18px,calc((100vw - 760px)/2));border-bottom:1px solid #303B34;background:rgba(20,25,22,.94);backdrop-filter:blur(18px)}
      .hub-back{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;color:#C2CEC6;text-decoration:none;font-size:25px}
      .hub-back:hover{background:#1D2922;color:#9BE8F4}
      .hub-brand{display:flex;align-items:center;gap:9px;flex:1;font-size:14px;letter-spacing:-.02em}
      .brand-dot{width:9px;height:9px;border-radius:50%;background:#9BE8F4;box-shadow:0 0 0 4px rgba(155,232,244,.09)}
      .hub-header-label{font-size:10px;letter-spacing:.16em;font-weight:750;color:#849188}
      .hub-content{width:min(100%,760px);margin:0 auto;padding:36px 20px 28px}
      .hub-intro{margin-bottom:24px}
      .eyebrow{font-size:10px;letter-spacing:.16em;font-weight:750;color:#9BE8F4}
      .hub-intro h1{margin:10px 0 8px;font-size:clamp(30px,7vw,42px);line-height:1.08;letter-spacing:-.055em;font-weight:650}
      .hub-intro p{max-width:390px;margin:0;color:#A0ACA3;font-size:14px;line-height:1.6}
      .hub-search{display:flex;align-items:center;gap:10px;height:48px;padding:0 14px;border:1px solid #344B3C;border-radius:14px;background:#1D2922;color:#9BE8F4;margin-bottom:18px}
      .hub-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#F0F4F0;font-size:13px}
      .hub-search input::placeholder{color:#849188}
      .hub-search button{border:0;background:transparent;color:#A0ACA3;font-size:22px;line-height:1}
      .hub-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .tool-card{display:flex;flex-direction:column;min-height:210px;padding:17px;border:1px solid #303F34;border-radius:19px;background:linear-gradient(155deg,#1D2922 0%,#19231D 100%);color:inherit;text-decoration:none;transition:border-color .18s ease,transform .18s ease,background .18s ease;animation:card-in .28s both;animation-delay:calc(var(--card-index)*35ms)}
      .tool-card:hover{border-color:rgba(155,232,244,.42);background:#202F25;transform:translateY(-2px)}
      .tool-card:focus-visible{outline:2px solid #9BE8F4;outline-offset:3px}
      .tool-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:25px}
      .tool-icon{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(155,232,244,.17);border-radius:13px;background:rgba(155,232,244,.07);color:#9BE8F4}
      .tool-arrow{color:#718077;transition:color .18s,transform .18s}
      .tool-card:hover .tool-arrow{color:#9BE8F4;transform:translateX(2px)}
      .tool-detail{font-size:9px;letter-spacing:.14em;font-weight:800;color:#849188}
      .tool-card h2{margin:7px 0 7px;font-size:17px;letter-spacing:-.025em;font-weight:650}
      .tool-card p{margin:0;color:#A0ACA3;font-size:12px;line-height:1.55}
      .hub-empty{padding:24px;border:1px solid #303F34;border-radius:16px;color:#A0ACA3;text-align:center}
      .hub-empty button{border:0;border-radius:9px;padding:9px 12px;background:#263B30;color:#9BE8F4}
      .hub-footnote{margin:22px 2px 0;color:#718077;font-size:11px;line-height:1.55;text-align:center}
      .hub-nav{position:fixed;z-index:80;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(540px,calc(100% - 24px));min-height:68px;display:flex;align-items:stretch;gap:5px;padding:7px;border:1px solid #344B3C;border-radius:23px;background:rgba(29,41,34,.96);backdrop-filter:blur(24px);box-shadow:0 18px 48px rgba(0,0,0,.34)}
      .hub-nav a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border-radius:15px;color:#849188;text-decoration:none;font-size:10px;font-weight:650}
      .hub-nav a.active{background:#9BE8F4;color:#142126}
      .hub-nav svg{width:20px;height:20px}
      @keyframes card-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
      @media(min-width:760px){.hub-content{padding:48px 26px 30px}.hub-grid{gap:14px}.tool-card{min-height:224px;padding:21px}.tool-card h2{font-size:19px}.tool-card p{font-size:13px}.hub-nav{bottom:18px}.hub-nav a{flex-direction:row;gap:9px;font-size:12px}}
      @media(max-width:390px){.hub-content{padding:28px 14px 24px}.hub-grid{gap:9px}.tool-card{min-height:218px;padding:13px;border-radius:16px}.tool-card-top{margin-bottom:20px}.tool-card h2{font-size:15px}.tool-card p{font-size:11px}}
      @media(prefers-reduced-motion:reduce){.tool-card{animation:none;transition:none}}
    `}</style>
  </main>;
}
