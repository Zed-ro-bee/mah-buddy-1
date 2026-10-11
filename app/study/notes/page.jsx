"use client";

import { useEffect, useState } from "react";

const KEY = "mah-buddy-saved-study-notes";

function Icon({ name }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    back: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
    note: <><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 12h7M8 16h7"/></>,
    save: <><path d="M5 3h12l3 3v15H4V3h1Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
  };
  return <svg {...p}>{paths[name] || paths.note}</svg>;
}

export default function StudyNotesPage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Clear and simple");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try { const data = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(data)) setSaved(data); } catch {}
  }, []);

  async function generate() {
    if (!topic.trim() || busy) return;
    setBusy(true); setError(""); setNotes("");
    try {
      let profile = {};
      try { profile = JSON.parse(localStorage.getItem("mah-buddy-profile") || "{}"); } catch {}
      const prompt = "Create useful study notes on: " + topic.trim() + ". Style: " + level + ". Use a clear title, short headings, concise bullet points, key terms with definitions, one simple example, and a short recap. Keep facts accurate; say when something is uncertain. Format with plain text headings and bullets. Do not add a quiz unless requested.";
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }], customInstructions: "You are Mah Buddy, a careful study assistant. Write well-organised, age-appropriate revision notes.", memory: "Generate study notes for the requested topic.", profile, difficulty: "Normal" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate notes.");
      setNotes(String(data.text || "").trim());
    } catch (e) { setError(e.message || "Could not generate notes. Please try again."); }
    finally { setBusy(false); }
  }

  function saveNotes() {
    if (!notes.trim()) return;
    const entry = { id: Date.now(), title: topic.trim() || "Study notes", content: notes, savedAt: new Date().toISOString() };
    const next = [entry, ...saved].slice(0, 40);
    setSaved(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function openSaved(item) { setTopic(item.title); setNotes(item.content); setError(""); }

  return <main className="notes-page">
    <header className="notes-header"><a href="/study" aria-label="Back to Study"><Icon name="back"/></a><div><strong>Study notes</strong><span>Your personal revision space</span></div><span className="notes-header-icon"><Icon name="note"/></span></header>
    <section className="notes-content">
      <div className="notes-intro"><span className="eyebrow">UNDERSTAND & REVISE</span><h1>Make the topic clearer.</h1><p>Tell Mah Buddy what you’re studying. It’ll organise the essentials into notes you can save and revisit.</p></div>
      <section className="notes-form">
        <label htmlFor="topic">What are you studying?</label>
        <input id="topic" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => { if (e.key === "Enter") generate(); }} placeholder="e.g. Cell division, quadratic equations"/>
        <label>Explanation style</label>
        <div className="style-options">{["Clear and simple", "Exam revision", "Detailed"].map(x => <button type="button" key={x} className={level === x ? "selected" : ""} onClick={() => setLevel(x)}>{x}</button>)}</div>
        <button className="generate" disabled={!topic.trim() || busy} onClick={generate}><Icon name="sparkle"/>{busy ? "Creating your notes…" : "Generate study notes"}</button>
        {error && <p className="notes-error">{error}</p>}
      </section>
      {notes && <section className="generated-notes"><div className="generated-head"><div><span className="eyebrow">YOUR NOTES</span><h2>{topic.trim() || "Study notes"}</h2></div><button onClick={saveNotes}><Icon name="save"/> Save</button></div><article>{notes}</article><p className="notes-disclaimer">Check important facts against your class materials.</p></section>}
      {saved.length > 0 && <section className="saved-section"><div className="saved-title"><h2>Saved notes</h2><span>{saved.length}</span></div>{saved.map(item => <button className="saved-note" key={item.id} onClick={() => openSaved(item)}><span className="saved-note-icon"><Icon name="note"/></span><span><strong>{item.title}</strong><small>{new Date(item.savedAt).toLocaleDateString()}</small></span><span className="saved-arrow">↗</span></button>)}</section>}
    </section>
    <style jsx>{`
      :global(*){box-sizing:border-box}
      .notes-page{min-height:100dvh;background:#141916;color:#F0F4F0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:40px}
      .notes-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:13px;min-height:64px;padding:10px max(18px,calc((100vw - 700px)/2));border-bottom:1px solid #303B34;background:rgba(20,25,22,.95);backdrop-filter:blur(16px)}
      .notes-header>a{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;color:#C2CEC6;text-decoration:none}
      .notes-header>a:hover{background:#1D2922;color:#9BE8F4}
      .notes-header>div{display:flex;flex:1;flex-direction:column;gap:3px}.notes-header strong{font-size:14px}.notes-header span{font-size:11px;color:#849188}
      .notes-header .notes-header-icon{display:grid;place-items:center;width:36px;height:36px;border:1px solid #344B3C;border-radius:12px;color:#9BE8F4;background:#1D2922}
      .notes-content{width:min(100%,700px);margin:0 auto;padding:34px 20px}
      .notes-intro{margin-bottom:23px}.eyebrow{color:#9BE8F4;font-size:10px;letter-spacing:.15em;font-weight:800}
      .notes-intro h1{margin:10px 0 8px;font-size:clamp(29px,7vw,40px);line-height:1.08;letter-spacing:-.05em}
      .notes-intro p{max-width:480px;margin:0;color:#A0ACA3;font-size:13px;line-height:1.65}
      .notes-form,.generated-notes,.saved-section{padding:18px;border:1px solid #303F34;border-radius:18px;background:#19231D}
      .notes-form label{display:block;margin:0 0 8px;color:#D8E0D9;font-size:12px;font-weight:700}
      .notes-form input{width:100%;height:46px;margin-bottom:17px;padding:0 13px;border:1px solid #3A4A3F;border-radius:12px;background:#141916;color:#F0F4F0;font-size:13px;outline:0}
      .notes-form input:focus{border-color:#9BE8F4;box-shadow:0 0 0 2px rgba(155,232,244,.08)}
      .notes-form input::placeholder{color:#718077}
      .style-options{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:17px}
      .style-options button{padding:9px 11px;border:1px solid #344B3C;border-radius:10px;background:#1D2922;color:#A0ACA3;font-size:11px}
      .style-options button.selected{border-color:rgba(155,232,244,.5);background:rgba(155,232,244,.1);color:#9BE8F4}
      .generate{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:46px;border:0;border-radius:12px;background:#9BE8F4;color:#142126;font-size:13px;font-weight:750}
      .generate:disabled{opacity:.5;cursor:wait}
      .notes-error{margin:12px 0 0;color:#ff9a9a;font-size:12px}
      .generated-notes{margin-top:15px}
      .generated-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:14px;border-bottom:1px solid #303F34}
      .generated-head h2{margin:6px 0 0;font-size:20px;letter-spacing:-.03em}
      .generated-head button{display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #344B3C;border-radius:10px;background:#263B30;color:#9BE8F4;font-size:11px;font-weight:700}
      article{padding:16px 1px 2px;color:#D8E0D9;font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
      .notes-disclaimer{margin:12px 0 0;color:#718077;font-size:10px}
      .saved-section{margin-top:16px}.saved-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.saved-title h2{margin:0;font-size:15px}.saved-title>span{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:8px;background:#263B30;color:#9BE8F4;font-size:10px}
      .saved-note{display:flex;align-items:center;gap:11px;width:100%;padding:12px 0;border:0;border-top:1px solid #303F34;background:transparent;text-align:left;color:#F0F4F0}
      .saved-note-icon{display:grid;place-items:center;flex:0 0 36px;height:36px;border-radius:11px;background:#263B30;color:#9BE8F4}
      .saved-note>span:nth-child(2){display:flex;flex:1;min-width:0;flex-direction:column;gap:4px}.saved-note strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.saved-note small{font-size:10px;color:#849188}.saved-arrow{color:#849188}
      @media(min-width:760px){.notes-content{padding:44px 26px}.notes-form,.generated-notes,.saved-section{padding:22px}}
      @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
    `}</style>
  </main>;
}
