"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Note = { id: string | number; title: string; content: string; savedAt?: string };
type Upload = { id: string; name: string; size: number; type: string; addedAt: string; content?: string };
type Tab = "All" | "Notes" | "Uploads" | "Saved";

const SUBJECTS = [
  { name: "Mathematics", detail: "Numbers, algebra & more", icon: "math", topic: "Mathematics", tint: "mint" },
  { name: "Science", detail: "Physics, chemistry, biology", icon: "science", topic: "Science", tint: "blue" },
  { name: "Languages", detail: "Grammar, writing & reading", icon: "language", topic: "Languages", tint: "violet" },
  { name: "Humanities", detail: "History, geography & society", icon: "globe", topic: "Humanities", tint: "amber" },
  { name: "Technology", detail: "Computing & digital skills", icon: "code", topic: "Technology", tint: "blue" },
  { name: "Business", detail: "Economics & entrepreneurship", icon: "chart", topic: "Business", tint: "mint" },
];

const LEARNING_SITES = [
  { name: "Khan Academy", description: "Free lessons and practice across many subjects.", url: "https://www.khanacademy.org/", mark: "K", category: "Free learning" },
  { name: "OpenStax", description: "Free, openly licensed textbooks.", url: "https://openstax.org/subjects", mark: "O", category: "Open textbooks" },
  { name: "MIT OpenCourseWare", description: "Course materials from a wide range of disciplines.", url: "https://ocw.mit.edu/", mark: "M", category: "University courses" },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    math: <><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8M8 12h2m4 0h2M8 16h2m4 0h2"/></>,
    science: <><path d="M9 3h6M10 3v6l-5.5 9a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M8 16h8"/></>,
    language: <><path d="M4 5h11M9.5 3v2c0 6-3 9-6 11M6 10c1.5 2.5 3.5 4 6 5M14 20l4-10 4 10M15.5 17h5"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 6h7M8 9h7"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></>,
    bookmark: <><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
  };
  return <svg {...shared}>{paths[name] || paths.book}</svg>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function LibraryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const [activeSubject, setActiveSubject] = useState("");
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const n = JSON.parse(localStorage.getItem("mah-buddy-saved-study-notes") || "[]");
      const c = JSON.parse(localStorage.getItem("mah-buddy-history") || "[]");
      const u = JSON.parse(localStorage.getItem("mah-buddy-resource-uploads") || "[]");
      if (Array.isArray(n)) setNotes(n);
      if (Array.isArray(c)) setChats(c);
      if (Array.isArray(u)) setUploads(u);
    } catch {}
  }, []);

  const matchingNotes = useMemo(() => notes.filter(n => (String(n.title || "") + " " + String(n.content || "")).toLowerCase().includes(search.toLowerCase().trim())), [notes, search]);
  const matchingUploads = useMemo(() => uploads.filter(u => (u.name + " " + u.type).toLowerCase().includes(search.toLowerCase().trim())), [uploads, search]);

  function announce(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function removeNote(id: string | number) {
    const next = notes.filter(n => String(n.id) !== String(id));
    setNotes(next);
    try { localStorage.setItem("mah-buddy-saved-study-notes", JSON.stringify(next)); } catch {}
    announce("Note removed from your library.");
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const added: Upload[] = [];
    for (const file of files.slice(0, 5)) {
      const isText = /\.(txt|md|markdown)$/i.test(file.name) || file.type === "text/plain";
      if (isText && file.size <= 250_000) {
        try {
          const content = await file.text();
          const note: Note = { id: "upload-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), title: file.name.replace(/\.(txt|md|markdown)$/i, ""), content, savedAt: new Date().toISOString() };
          const nextNotes = [note, ...notes, ...added.filter(x => x.content).map(x => ({ id: x.id, title: x.name, content: x.content || "", savedAt: x.addedAt }))];
          setNotes(nextNotes);
          try { localStorage.setItem("mah-buddy-saved-study-notes", JSON.stringify(nextNotes)); } catch {}
          added.push({ id: note.id.toString(), name: file.name, size: file.size, type: "Text note", addedAt: new Date().toISOString(), content });
        } catch {}
      } else {
        added.push({ id: "file-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), name: file.name, size: file.size, type: file.type || "Document", addedAt: new Date().toISOString() });
      }
    }
    if (added.length) {
      const next = [...uploads, ...added];
      setUploads(next);
      try { localStorage.setItem("mah-buddy-resource-uploads", JSON.stringify(next)); } catch {}
      announce("Added " + added.length + (added.length === 1 ? " item" : " items") + " to your library.");
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeUpload(id: string) {
    const next = uploads.filter(u => u.id !== id);
    setUploads(next);
    try { localStorage.setItem("mah-buddy-resource-uploads", JSON.stringify(next)); } catch {}
    announce("Upload removed.");
  }

  function startTopicTool(topic: string, tool: "quiz" | "flashcards") {
    window.location.href = "/" + tool + "?topic=" + encodeURIComponent(topic) + "&autostart=1";
  }

  const hasResults = matchingNotes.length + matchingUploads.length > 0;
  const visibleNotes = tab === "Uploads" ? [] : matchingNotes;
  const visibleUploads = tab === "Notes" ? [] : matchingUploads;

  return (
    <main className="resources-page">
      <header className="resources-header">
        <a href="/study" className="brand-back"><span className="brand-mark"><Icon name="spark" size={19}/></span><span><strong>mah buddy</strong><small>YOUR LEARNING SPACE</small></span></a>
        <button className="upload-top" onClick={() => fileInput.current?.click()}><Icon name="upload" size={16}/><span>Add materials</span></button>
      </header>
      <input ref={fileInput} className="hidden-input" type="file" accept=".txt,.md,.markdown,.pdf,.doc,.docx,.ppt,.pptx" multiple onChange={handleUpload} aria-label="Upload study materials"/>

      <section className="resources-hero">
        <div className="hero-copy">
          <span className="eyebrow"><i/> YOUR PERSONAL STUDY LIBRARY</span>
          <h1>Good resources.<br/><em>Greater possibilities.</em></h1>
          <p>Keep your notes close, explore new subjects, and turn what you find into real understanding.</p>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-book"><Icon name="book" size={47}/></div><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><span className="art-chip">LEARN · GROW</span></div>
      </section>

      <section className="search-row">
        <label className="search-box"><Icon name="search" size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your library or a subject..." aria-label="Search resources"/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><Icon name="close" size={16}/></button>}</label>
        <button className="filter-button" onClick={() => setTab(tab === "Saved" ? "All" : "Saved")} aria-label="Show saved notes"><Icon name="bookmark" size={18}/></button>
      </section>

      <section className="subject-section">
        <div className="section-heading"><div><span className="section-kicker">EXPLORE SOMETHING NEW</span><h2>Browse subjects</h2></div><span className="section-note">Made for every learner</span></div>
        <div className="subject-grid">
          {SUBJECTS.filter(s => !search || (s.name + " " + s.detail).toLowerCase().includes(search.toLowerCase())).map(subject => (
            <article className={"subject-card " + subject.tint} key={subject.name}>
              <button className="subject-main" onClick={() => setActiveSubject(activeSubject === subject.name ? "" : subject.name)} aria-expanded={activeSubject === subject.name}>
                <span className="subject-icon"><Icon name={subject.icon} size={22}/></span><span className="subject-copy"><strong>{subject.name}</strong><small>{subject.detail}</small></span><span className="subject-arrow"><Icon name="arrow" size={17}/></span>
              </button>
              {activeSubject === subject.name && <div className="subject-actions"><button onClick={() => startTopicTool(subject.topic, "quiz")}>Take a quiz <Icon name="arrow" size={14}/></button><button onClick={() => startTopicTool(subject.topic, "flashcards")}>Create flashcards <Icon name="arrow" size={14}/></button><button onClick={() => { window.location.href = "/?prompt=" + encodeURIComponent("Help me learn " + subject.topic + ". Start with a simple overview, then give me examples and check my understanding.") + "&autostart=1"; }}>Ask Mah Buddy <Icon name="arrow" size={14}/></button></div>}
            </article>
          ))}
        </div>
      </section>

      <section className="tools-strip">
        <div className="tools-copy"><span className="section-kicker">MAKE KNOWLEDGE STICK</span><h2>Study smarter with Mah Buddy.</h2><p>Use your resources as a starting point for active learning.</p></div>
        <div className="tool-actions"><a href="/flashcards" className="tool-card"><span><Icon name="book" size={19}/></span><b>Flashcards</b><small>Remember key ideas</small><Icon name="arrow" size={15}/></a><a href="/quiz" className="tool-card"><span><Icon name="check" size={19}/></span><b>Quizzes</b><small>Check understanding</small><Icon name="arrow" size={15}/></a></div>
      </section>

      <section className="personal-section">
        <div className="section-heading"><div><span className="section-kicker">YOURS, ALL IN ONE PLACE</span><h2>My library</h2></div><button className="text-action" onClick={() => fileInput.current?.click()}><Icon name="upload" size={15}/> Add materials</button></div>
        <div className="library-tabs" role="tablist" aria-label="Library filters">
          {(["All", "Notes", "Uploads", "Saved"] as Tab[]).map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}{t === "Notes" ? <span>{notes.length}</span> : t === "Uploads" ? <span>{uploads.length}</span> : null}</button>)}
        </div>

        {tab === "Saved" ? (
          <div className="saved-panel">
            <div className="saved-intro"><span className="saved-icon"><Icon name="bookmark" size={20}/></span><div><strong>Saved notes</strong><small>Your notes stay on this device.</small></div><b>{matchingNotes.length}</b></div>
            {matchingNotes.length ? matchingNotes.map(note => <article className="note-row" key={String(note.id)}><span className="file-icon"><Icon name="file" size={19}/></span><div className="note-content"><strong>{note.title || "Untitled note"}</strong><small>{note.savedAt ? new Date(note.savedAt).toLocaleDateString() : "Saved note"}</small><p>{String(note.content || "").slice(0, 170)}{String(note.content || "").length > 170 ? "…" : ""}</p><div className="note-actions"><button onClick={() => { try { sessionStorage.setItem("mah-buddy-library-open-note", String(note.id)); } catch {} window.location.href = "/study/notes"; }}>Open note <Icon name="arrow" size={13}/></button><button onClick={() => removeNote(note.id)} className="muted-action"><Icon name="trash" size={13}/> Remove</button></div></div></article>) : <EmptyState title="Nothing saved yet" text="Save a study note and it will be ready here whenever you need it."/>}
          </div>
        ) : (
          <div className="library-list">
            {visibleNotes.length > 0 && visibleNotes.map(note => <article className="note-row" key={String(note.id)}><span className="file-icon"><Icon name="file" size={19}/></span><div className="note-content"><strong>{note.title || "Untitled note"}</strong><small>{note.savedAt ? new Date(note.savedAt).toLocaleDateString() : "Saved note"}</small><p>{String(note.content || "").slice(0, 130)}{String(note.content || "").length > 130 ? "…" : ""}</p><div className="note-actions"><button onClick={() => { try { sessionStorage.setItem("mah-buddy-library-open-note", String(note.id)); } catch {} window.location.href = "/study/notes"; }}>Open note <Icon name="arrow" size={13}/></button><button onClick={() => removeNote(note.id)} className="muted-action"><Icon name="trash" size={13}/> Remove</button></div></div></article>)}
            {visibleUploads.length > 0 && visibleUploads.map(file => <article className="note-row" key={file.id}><span className="file-icon"><Icon name="file" size={19}/></span><div className="note-content"><strong>{file.name}</strong><small>{file.type} · {formatSize(file.size)} · {new Date(file.addedAt).toLocaleDateString()}</small>{file.content && <p>{file.content.slice(0, 130)}{file.content.length > 130 ? "…" : ""}</p>}<div className="note-actions">{file.content && <button onClick={() => { try { sessionStorage.setItem("mah-buddy-library-open-note", file.id); } catch {} window.location.href = "/study/notes"; }}>Open note <Icon name="arrow" size={13}/></button>}<button onClick={() => removeUpload(file.id)} className="muted-action"><Icon name="trash" size={13}/> Remove</button></div></div></article>)}
            {!hasResults && <EmptyState title={search ? "No matches found" : tab === "Notes" ? "No notes yet" : tab === "Uploads" ? "No uploads yet" : "Your library is ready"} text={search ? "Try a different subject or search term." : "Add a text note or upload study materials to start building your personal collection."} action={() => fileInput.current?.click()}/>}
          </div>
        )}
        <p className="privacy-note"><Icon name="check" size={14}/> Your saved notes and upload list are stored locally on this device.</p>
      </section>

      <section className="open-learning">
        <div className="section-heading"><div><span className="section-kicker">EXPLORE BEYOND YOUR NOTES</span><h2>Open learning resources</h2></div></div>
        <div className="learning-grid">{LEARNING_SITES.map(site => <a key={site.name} className="learning-card" href={site.url} target="_blank" rel="noreferrer"><span className="learning-mark">{site.mark}</span><span className="learning-meta"><small>{site.category}</small><strong>{site.name}</strong><p>{site.description}</p></span><Icon name="external" size={17}/></a>)}</div>
        <p className="source-note">External resources open on their own websites. Availability and terms are set by each provider.</p>
      </section>

      <section className="recent-section">
        <div className="section-heading"><div><span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Recent conversations</h2></div><a href="/" className="text-action">Open AI Assistance <Icon name="arrow" size={14}/></a></div>
        {chats.length ? <div className="recent-list">{chats.slice().sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 4).map(chat => <a key={chat.id} href="/" className="recent-row"><span className="recent-icon"><Icon name="clock" size={17}/></span><span><strong>{chat.title || "Study conversation"}</strong><small>{new Date(chat.updatedAt || Date.now()).toLocaleDateString()}</small></span><Icon name="arrow" size={16}/></a>)}</div> : <EmptyState title="No recent conversations" text="Start a chat with Mah Buddy and your recent conversations will be shown here." action={() => { window.location.href = "/"; }}/>}
      </section>

      {toast && <div className="toast" role="status"><Icon name="check" size={17}/>{toast}</div>}

      <style jsx>{css}</style>
    </main>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: () => void }) {
  return <div className="empty-state"><span><Icon name="book" size={23}/></span><strong>{title}</strong><p>{text}</p>{action && <button onClick={action}>Add a resource <Icon name="arrow" size={14}/></button>}</div>;
}

const css = `
.resources-page{min-height:100dvh;background:var(--mb-ink,#141916);color:var(--mb-cloud,#F0F4F0);padding:0 18px 125px;font-family:Inter,system-ui,sans-serif}
.resources-header{height:66px;max-width:940px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(220,240,228,.09)}
.brand-back{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}.brand-back>span:last-child{display:flex;flex-direction:column;gap:3px}.brand-back strong{font-size:15px;letter-spacing:-.04em}.brand-back small{font-size:8px;letter-spacing:.16em;color:var(--mb-muted,#A0ACA3);font-weight:800}.brand-mark{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--mb-border,rgba(155,232,244,.14));background:var(--mb-surface,#1D2922);border-radius:12px;color:var(--mb-cyan,#9BE8F4)}
.upload-top,.text-action{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--mb-border,rgba(155,232,244,.14));border-radius:12px;background:var(--mb-surface,#1D2922);color:var(--mb-cyan,#9BE8F4);font-size:11px;font-weight:750;padding:10px 12px;text-decoration:none;white-space:nowrap}.hidden-input{display:none}
.resources-hero{position:relative;overflow:hidden;max-width:940px;min-height:230px;margin:26px auto 20px;border:1px solid rgba(155,232,244,.14);border-radius:25px;background:radial-gradient(ellipse at 78% 28%,rgba(77,133,101,.24),transparent 36%),linear-gradient(125deg,#1B2921 0%,#18231D 57%,#21392C 100%);display:flex;align-items:center;padding:clamp(22px,5vw,38px);gap:15px}
.hero-copy{position:relative;z-index:2;max-width:570px}.eyebrow,.section-kicker{display:block;font-size:9px;letter-spacing:.15em;font-weight:850;color:var(--mb-cyan,#9BE8F4)}.eyebrow{display:flex;align-items:center;gap:8px}.eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--mb-cyan,#9BE8F4);box-shadow:0 0 12px var(--mb-cyan,#9BE8F4)}.hero-copy h1{font-size:clamp(32px,6vw,49px);line-height:.98;letter-spacing:-.06em;margin:16px 0 12px;font-weight:780}.hero-copy h1 em{font-style:normal;color:var(--mb-cyan,#9BE8F4)}.hero-copy p{max-width:390px;font-size:12px;line-height:1.75;color:var(--mb-muted,#A0ACA3);margin:0}
.hero-art{position:absolute;right:5%;top:0;bottom:0;width:32%;min-width:170px;display:grid;place-items:center;color:var(--mb-cyan,#9BE8F4);opacity:.88}.art-orbit{position:absolute;border:1px solid rgba(155,232,244,.28);border-radius:50%;transform:rotate(-28deg)}.orbit-one{width:190px;height:100px}.orbit-two{width:135px;height:190px;transform:rotate(36deg);border-color:rgba(155,232,244,.14)}.art-book{width:85px;height:85px;border:1px solid rgba(155,232,244,.34);border-radius:27px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(155,232,244,.16),rgba(25,43,33,.88));box-shadow:0 16px 50px rgba(0,0,0,.2);transform:rotate(-8deg)}.art-star{position:absolute;font-size:24px;color:#d4f7ff}.star-one{top:26%;right:19%}.star-two{bottom:22%;left:13%}.art-chip{position:absolute;bottom:20%;right:7%;font-size:7px;font-weight:850;letter-spacing:.13em;border:1px solid rgba(155,232,244,.24);background:rgba(12,24,18,.65);border-radius:20px;padding:7px 9px}
.search-row{max-width:940px;margin:0 auto 34px;display:flex;gap:10px}.search-box{height:48px;display:flex;align-items:center;gap:11px;flex:1;min-width:0;border:1px solid rgba(155,232,244,.17);background:var(--mb-surface,#1D2922);border-radius:14px;padding:0 14px;color:var(--mb-cyan,#9BE8F4)}.search-box input{width:100%;min-width:0;background:transparent;border:0;outline:0;color:var(--mb-cloud,#F0F4F0);font-size:12px}.search-box input::placeholder{color:var(--mb-subtle,#849188)}.search-box button,.filter-button{border:0;background:transparent;color:var(--mb-muted,#A0ACA3);display:grid;place-items:center}.filter-button{width:48px;flex:0 0 48px;border:1px solid rgba(155,232,244,.17);border-radius:14px;background:var(--mb-surface,#1D2922);color:var(--mb-cyan,#9BE8F4)}
.subject-section,.personal-section,.open-learning,.recent-section{max-width:940px;margin:0 auto 36px}.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:15px}.section-heading h2,.tools-copy h2{font-size:clamp(21px,4vw,26px);letter-spacing:-.045em;margin:7px 0 0;font-weight:760}.section-note{font-size:10px;color:var(--mb-muted,#A0ACA3);padding-bottom:3px}.subject-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.subject-card{min-width:0;overflow:hidden;border:1px solid rgba(220,240,228,.09);border-radius:17px;background:linear-gradient(130deg,rgba(35,54,43,.88),rgba(25,36,29,.92));transition:border-color .18s ease,transform .18s ease}.subject-card:hover{border-color:rgba(155,232,244,.27);transform:translateY(-1px)}.subject-main{width:100%;min-width:0;display:flex;align-items:center;gap:11px;text-align:left;border:0;background:transparent;padding:14px 12px;color:inherit}.subject-icon{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:13px;background:rgba(155,232,244,.10);color:var(--mb-cyan,#9BE8F4)}.subject-card.violet .subject-icon{background:rgba(183,164,255,.12);color:#c4b7ff}.subject-card.amber .subject-icon{background:rgba(255,205,130,.12);color:#ffd18d}.subject-card.blue .subject-icon{background:rgba(116,196,255,.12);color:#8ad5ff}.subject-copy{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}.subject-copy strong{font-size:12px;font-weight:750}.subject-copy small{font-size:10px;line-height:1.45;color:var(--mb-muted,#A0ACA3)}.subject-arrow{color:var(--mb-subtle,#849188);display:grid;place-items:center}.subject-actions{display:grid;grid-template-columns:1fr;gap:6px;border-top:1px solid rgba(220,240,228,.08);padding:9px 12px 12px}.subject-actions button{display:flex;justify-content:space-between;align-items:center;border:1px solid rgba(155,232,244,.12);border-radius:9px;padding:9px 10px;background:rgba(9,19,14,.2);color:var(--mb-cloud,#F0F4F0);font-size:10px;text-align:left}
.tools-strip{max-width:940px;margin:0 auto 38px;padding:20px;border:1px solid rgba(155,232,244,.14);border-radius:21px;background:linear-gradient(115deg,#1B2B22,#19241D)}.tools-copy h2{font-size:22px}.tools-copy p{font-size:11px;line-height:1.6;color:var(--mb-muted,#A0ACA3);margin:8px 0 16px}.tool-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tool-card{position:relative;display:flex;flex-direction:column;gap:7px;padding:13px;border:1px solid rgba(155,232,244,.12);border-radius:14px;background:rgba(8,18,12,.2);color:inherit;text-decoration:none;min-width:0}.tool-card>span{width:32px;height:32px;border-radius:10px;background:rgba(155,232,244,.1);color:var(--mb-cyan,#9BE8F4);display:grid;place-items:center}.tool-card b{font-size:12px}.tool-card small{font-size:10px;color:var(--mb-muted,#A0ACA3)}.tool-card>svg{position:absolute;right:12px;top:19px;color:var(--mb-subtle,#849188)}
.library-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:12px}.library-tabs button{display:flex;align-items:center;gap:7px;flex:0 0 auto;border:1px solid rgba(220,240,228,.1);border-radius:30px;padding:9px 13px;background:transparent;color:var(--mb-muted,#A0ACA3);font-size:10px;font-weight:750}.library-tabs button.active{background:var(--mb-cyan,#9BE8F4);border-color:var(--mb-cyan,#9BE8F4);color:#10201A}.library-tabs button span{font-size:9px;opacity:.8}.library-list,.saved-panel{border:1px solid rgba(220,240,228,.1);border-radius:18px;background:rgba(25,36,29,.78);overflow:hidden}.note-row{display:flex;align-items:flex-start;gap:12px;padding:15px;border-bottom:1px solid rgba(220,240,228,.07)}.note-row:last-child{border-bottom:0}.file-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:12px;background:rgba(155,232,244,.09);color:var(--mb-cyan,#9BE8F4)}.note-content{min-width:0;flex:1}.note-content>strong{font-size:12px;display:block;overflow-wrap:anywhere}.note-content>small{display:block;font-size:9px;color:var(--mb-subtle,#849188);margin-top:5px}.note-content p{font-size:10px;line-height:1.6;color:var(--mb-muted,#A0ACA3);margin:8px 0}.note-actions{display:flex;gap:14px;flex-wrap:wrap}.note-actions button{display:inline-flex;align-items:center;gap:5px;border:0;padding:0;background:transparent;color:var(--mb-cyan,#9BE8F4);font-size:10px;font-weight:700}.note-actions .muted-action{color:var(--mb-subtle,#849188)}.saved-intro{display:flex;align-items:center;gap:11px;padding:15px;border-bottom:1px solid rgba(220,240,228,.07)}.saved-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(155,232,244,.1);color:var(--mb-cyan,#9BE8F4)}.saved-intro>div{display:flex;flex-direction:column;gap:4px;flex:1}.saved-intro strong{font-size:12px}.saved-intro small{font-size:10px;color:var(--mb-muted,#A0ACA3)}.saved-intro>b{font-size:11px;color:var(--mb-cyan,#9BE8F4)}
.empty-state{display:flex;flex-direction:column;align-items:center;text-align:center;padding:27px 20px}.empty-state>span{width:46px;height:46px;display:grid;place-items:center;border-radius:15px;background:rgba(155,232,244,.08);color:var(--mb-cyan,#9BE8F4);margin-bottom:11px}.empty-state strong{font-size:12px}.empty-state p{max-width:310px;font-size:10px;line-height:1.65;color:var(--mb-muted,#A0ACA3);margin:7px 0 13px}.empty-state button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--mb-border,rgba(155,232,244,.14));border-radius:10px;padding:9px 12px;background:var(--mb-surface,#1D2922);color:var(--mb-cyan,#9BE8F4);font-size:10px;font-weight:750}.privacy-note{display:flex;align-items:center;gap:7px;font-size:9px;line-height:1.6;color:var(--mb-subtle,#849188);margin:12px 2px 0}.privacy-note svg{color:var(--mb-cyan,#9BE8F4);flex-shrink:0}
.learning-grid{display:grid;grid-template-columns:1fr;gap:9px}.learning-card{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid rgba(220,240,228,.1);border-radius:15px;background:var(--mb-surface,#1D2922);text-decoration:none;color:inherit}.learning-mark{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:12px;background:rgba(155,232,244,.1);color:var(--mb-cyan,#9BE8F4);font-weight:850;font-size:16px}.learning-meta{min-width:0;flex:1}.learning-meta small{font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:var(--mb-cyan,#9BE8F4)}.learning-meta strong{display:block;font-size:12px;margin-top:4px}.learning-meta p{font-size:10px;color:var(--mb-muted,#A0ACA3);line-height:1.5;margin:4px 0 0}.learning-card>svg{color:var(--mb-subtle,#849188);flex-shrink:0}.source-note{font-size:9px;line-height:1.5;color:var(--mb-subtle,#849188);margin:10px 2px 0}
.recent-list{border:1px solid rgba(220,240,228,.1);border-radius:16px;background:rgba(25,36,29,.78);overflow:hidden}.recent-row{display:flex;align-items:center;gap:10px;padding:13px;border-bottom:1px solid rgba(220,240,228,.07);color:inherit;text-decoration:none}.recent-row:last-child{border-bottom:0}.recent-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:rgba(155,232,244,.08);color:var(--mb-cyan,#9BE8F4)}.recent-row>span:nth-child(2){display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}.recent-row strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.recent-row small{font-size:9px;color:var(--mb-subtle,#849188)}.recent-row>svg{color:var(--mb-subtle,#849188)}.toast{position:fixed;z-index:1100;bottom:100px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;max-width:calc(100% - 28px);padding:12px 15px;border:1px solid var(--mb-border,rgba(155,232,244,.14));border-radius:14px;background:#1d2922;color:var(--mb-cloud,#F0F4F0);box-shadow:0 12px 35px rgba(0,0,0,.3);font-size:11px}.toast svg{color:var(--mb-cyan,#9BE8F4)}
@media(min-width:700px){.resources-page{padding-left:28px;padding-right:28px}.resources-hero{min-height:250px}.subject-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.subject-main{padding:16px}.subject-actions{grid-template-columns:1fr}.tools-strip{display:grid;grid-template-columns:1fr 1.2fr;align-items:center;gap:20px;padding:25px}.tools-copy p{margin-bottom:0}.tool-actions{gap:12px}.learning-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.learning-card{align-items:flex-start}.learning-card>svg{margin-left:auto}.note-row{padding:18px}}
@media(max-width:420px){.resources-page{padding-left:13px;padding-right:13px}.resources-hero{padding:22px 18px;min-height:235px}.hero-copy{max-width:100%}.hero-copy h1{font-size:34px}.hero-copy p{max-width:235px;font-size:11px}.hero-art{right:-42px;opacity:.42}.section-note{display:none}.subject-grid{gap:8px}.subject-main{gap:8px;padding:11px 9px}.subject-icon{width:34px;height:34px;flex-basis:34px;border-radius:11px}.subject-copy strong{font-size:11px}.subject-copy small{font-size:9px}.tools-strip{padding:16px}.tool-actions{gap:7px}.tool-card{padding:10px}.tool-card b{font-size:11px}.section-heading h2{font-size:22px}.upload-top{padding:9px}.upload-top span{display:none}}
@media(prefers-reduced-motion:reduce){.subject-card{transition:none}}
`;
