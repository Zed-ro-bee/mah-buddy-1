import type { Metadata } from "next";

const siteUrl = "https://mah-buddy.vercel.app";

export const metadata: Metadata = {
  title: "Explore Mah Buddy",
  description:
    "Explore Mah Buddy's AI assistance, study tools, quizzes, flashcards, library, voice features, and personal settings.",
  alternates: { canonical: "/about-mah-buddy" },
  openGraph: {
    title: "Explore Mah Buddy",
    description:
      "A visual guide to the tools that help you chat, learn, revise, and organise your study time.",
    url: `${siteUrl}/about-mah-buddy`,
    siteName: "Mah Buddy",
    type: "website",
  },
};

type PreviewKind = "chat" | "study" | "quiz" | "cards" | "library" | "voice" | "profile" | "settings";

const features: {
  number: string;
  title: string;
  tag: string;
  description: string;
  steps: string[];
  kind: PreviewKind;
  href: string;
}[] = [
  {
    number: "01",
    title: "AI Assistance",
    tag: "Ask. Understand. Keep going.",
    description:
      "Talk to Mah Buddy naturally. Ask questions, request clear explanations, explore a topic, or get help when something does not make sense. Start with your question and ask follow-ups whenever you need to.",
    steps: ["Open AI Assistance", "Type or speak your question", "Ask for a simpler or deeper explanation"],
    kind: "chat",
    href: "/",
  },
  {
    number: "02",
    title: "Your Study Space",
    tag: "Make learning feel manageable.",
    description:
      "Use the study area to focus on what you are learning and find the tools that support your revision. Move from a topic you are working on to practice when you are ready.",
    steps: ["Open Study", "Choose the study activity you need", "Return whenever you want to practise again"],
    kind: "study",
    href: "/study",
  },
  {
    number: "03",
    title: "Quizzes",
    tag: "Practise what you know.",
    description:
      "Turn revision into a quick knowledge check. Use quiz practice to test your understanding, notice topics that need another look, and build confidence through practice.",
    steps: ["Open the quiz tool", "Choose your topic and available options", "Answer each question and review your result"],
    kind: "quiz",
    href: "/quiz",
  },
  {
    number: "04",
    title: "Flashcards",
    tag: "Recall it, don't just reread it.",
    description:
      "Use flashcards to practise remembering key facts, definitions, terms, and ideas. Try answering before revealing the other side, then repeat the cards you want to learn more securely.",
    steps: ["Open Flashcards", "Create or choose a set when available", "Try to recall each answer before revealing it"],
    kind: "cards",
    href: "/flashcards",
  },
  {
    number: "05",
    title: "Library",
    tag: "Keep learning resources together.",
    description:
      "The Library is your place to find and organise study resources available in Mah Buddy. Open it when you want to return to learning material instead of starting from scratch.",
    steps: ["Open Library or Resources", "Browse the available material", "Open a resource to continue learning"],
    kind: "library",
    href: "/library",
  },
  {
    number: "06",
    title: "Voice and Conversation",
    tag: "A more natural way to interact.",
    description:
      "Where voice controls are available, use speech to make interacting with Mah Buddy feel more conversational. Check the on-screen controls and microphone permissions on your device.",
    steps: ["Look for the voice or microphone control", "Allow microphone access if prompted", "Speak clearly and follow the on-screen response"],
    kind: "voice",
    href: "/",
  },
  {
    number: "07",
    title: "Your Profile",
    tag: "Your personal space.",
    description:
      "Visit your profile to view your account details. Keeping your account information current helps you recognise the account you are using across Mah Buddy.",
    steps: ["Open Profile", "Review the details shown", "Use the available account controls when needed"],
    kind: "profile",
    href: "/profile",
  },
  {
    number: "08",
    title: "Settings and Preferences",
    tag: "Make the experience yours.",
    description:
      "Use settings to manage the preferences provided by your version of Mah Buddy. Options can vary as the product develops, so follow the controls currently shown in your account.",
    steps: ["Open the menu and choose Settings", "Review each available preference", "Save or confirm changes when prompted"],
    kind: "settings",
    href: "/settings",
  },
];

function PreviewFrame({ kind }: { kind: PreviewKind }) {
  return (
    <div className="preview-shell" aria-label={`Illustrative ${kind} interface preview`}>
      <div className="preview-topbar">
        <span className="preview-brand"><span className="preview-mark">m<span>.</span></span> mah buddy</span>
        <span className="preview-top-dots"><i /><i /><i /></span>
      </div>
      <div className="preview-content">
        {kind === "chat" && (
          <>
            <div className="preview-eyebrow">AI ASSISTANCE</div>
            <div className="preview-heading">What are we learning today?</div>
            <div className="preview-sub">Ask a question. We can work through it together.</div>
            <div className="chat-bubble user-bubble">Can you explain photosynthesis?</div>
            <div className="chat-bubble buddy-bubble"><span className="tiny-orb">✦</span><span>Plants use light energy to turn water and carbon dioxide into glucose and oxygen.</span></div>
            <div className="preview-input">Message Mah Buddy <span>↑</span></div>
          </>
        )}
        {kind === "study" && (
          <>
            <div className="preview-eyebrow">YOUR STUDY SPACE</div>
            <div className="preview-heading">Ready when you are.</div>
            <div className="preview-sub">Pick a way to keep moving.</div>
            <div className="preview-mini-grid"><div><b className="mini-symbol">✦</b><strong>Learn</strong><small>Explore a topic</small></div><div><b className="mini-symbol">↗</b><strong>Practise</strong><small>Check your progress</small></div><div><b className="mini-symbol">▤</b><strong>Review</strong><small>Revisit key ideas</small></div></div>
          </>
        )}
        {kind === "quiz" && (
          <>
            <div className="preview-row"><span className="preview-pill">QUIZ PRACTICE</span><span className="preview-count">01 / 10</span></div>
            <div className="preview-heading">Check your understanding</div>
            <div className="preview-sub">Which part of a plant absorbs most water?</div>
            <div className="answer-option selected"><span>A</span> Roots <b>✓</b></div><div className="answer-option"><span>B</span> Petals</div><div className="answer-option"><span>C</span> Fruit</div>
            <div className="preview-progress"><span /></div>
          </>
        )}
        {kind === "cards" && (
          <>
            <div className="preview-row"><span className="preview-pill">FLASHCARDS</span><span className="preview-count">4 cards</span></div>
            <div className="flashcard-visual"><span className="flashcard-star">✦</span><small>QUICK RECALL</small><strong>What is a cell?</strong><span className="flashcard-hint">Think of your answer, then reveal it</span><span className="flashcard-button">Reveal answer&nbsp; ↗</span></div>
            <div className="preview-card-dots"><i className="on" /><i /><i /><i /></div>
          </>
        )}
        {kind === "library" && (
          <>
            <div className="preview-eyebrow">YOUR LIBRARY</div><div className="preview-heading">Your learning, in one place.</div>
            <div className="library-item"><span className="library-icon">▤</span><span><strong>Study notes</strong><small>Reading and revision</small></span><b>↗</b></div>
            <div className="library-item"><span className="library-icon blue">✧</span><span><strong>Learning resources</strong><small>Explore available material</small></span><b>↗</b></div>
            <div className="library-item"><span className="library-icon gold">◇</span><span><strong>Saved learning</strong><small>Return when you need to</small></span><b>↗</b></div>
          </>
        )}
        {kind === "voice" && (
          <>
            <div className="preview-eyebrow">VOICE CONVERSATION</div><div className="preview-heading">Say it in your own words.</div><div className="preview-sub">Speak naturally when voice input is available.</div>
            <div className="voice-orbit"><span /><span /><span /><span /><b>🎙</b></div><div className="voice-caption">Listening for your question…</div><div className="voice-wave">{Array.from({ length: 23 }, (_, i) => <i key={i} style={{ height: `${9 + ((i * 17) % 25)}px` }} />)}</div>
          </>
        )}
        {kind === "profile" && (
          <>
            <div className="preview-eyebrow">YOUR ACCOUNT</div><div className="profile-hero"><div className="profile-avatar">M</div><strong>Your profile</strong><small>Your Mah Buddy account</small></div>
            <div className="profile-field"><small>DISPLAY NAME</small><strong>Student</strong><span>›</span></div><div className="profile-field"><small>ACCOUNT</small><strong>Signed-in profile</strong><span>›</span></div>
          </>
        )}
        {kind === "settings" && (
          <>
            <div className="preview-eyebrow">PREFERENCES</div><div className="preview-heading">Make it feel like yours.</div>
            <div className="setting-row"><span className="setting-icon">◐</span><span><strong>Appearance</strong><small>Choose your look</small></span><b>›</b></div><div className="setting-row"><span className="setting-icon">Aa</span><span><strong>Reading preferences</strong><small>Comfortable for you</small></span><b>›</b></div><div className="setting-row"><span className="setting-icon">⌘</span><span><strong>Account options</strong><small>Manage your experience</small></span><b>›</b></div>
          </>
        )}
      </div>
      <div className="preview-bottom"><span /><span /><span /><span /></div>
    </div>
  );
}

export default function AboutMahBuddyPage() {
  return (
    <main className="guide-page">
      <div className="guide-glow" aria-hidden="true" />
      <header className="guide-header">
        <a href="/" className="brand-lockup" aria-label="Mah Buddy home"><span className="brand-logo">m<span>.</span></span><span>mah buddy</span></a>
        <a className="header-link" href="/">Open Mah Buddy <span>↗</span></a>
      </header>

      <section className="guide-hero">
        <div className="hero-kicker"><span /> YOUR STUDY COMPANION, EXPLAINED</div>
        <h1>Meet the tools that<br /><span>move you forward.</span></h1>
        <p>From asking your first question to practising what you have learned, here is a simple guide to what Mah Buddy can help you do.</p>
        <div className="hero-actions"><a href="/">Start exploring <span>↗</span></a><span className="hero-note">A quick guide to Mah Buddy</span></div>
        <div className="hero-stats"><div><strong>Learn</strong><span>Understand new ideas</span></div><i /><div><strong>Practise</strong><span>Build your confidence</span></div><i /><div><strong>Return</strong><span>Keep your learning close</span></div></div>
      </section>

      <section className="features-section" id="features">
        <div className="section-intro"><div><span className="section-kicker">INSIDE MAH BUDDY</span><h2>One buddy. Many ways to learn.</h2></div><p>Explore each feature below. The visuals are illustrative guides to the kinds of screens and tasks you may see; the exact controls can vary by version.</p></div>
        <div className="feature-list">
          {features.map((feature, index) => (
            <article className={`feature-card ${index % 2 ? "reverse" : ""}`} key={feature.number} id={feature.title.toLowerCase().replaceAll(" ", "-")}>
              <div className="feature-visual"><div className="visual-label"><span className="visual-dot" /> INTERFACE PREVIEW <span className="visual-index">{feature.number} / 08</span></div><PreviewFrame kind={feature.kind} /></div>
              <div className="feature-copy"><span className="feature-number">{feature.number} — FEATURE</span><h3>{feature.title}</h3><p className="feature-tag">{feature.tag}</p><p className="feature-description">{feature.description}</p><div className="how-to"><span className="how-to-label">HOW TO USE IT</span>{feature.steps.map((step, i) => <div className="step-line" key={step}><span>{i + 1}</span><p>{step}</p></div>)}</div><a className="feature-link" href={feature.href}>Explore {feature.title} <span>↗</span></a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-card"><div className="closing-orb">✦</div><span className="section-kicker">YOUR NEXT STEP</span><h2>Small questions can lead<br />to big understanding.</h2><p>Open Mah Buddy, choose what you need, and take learning one step at a time.</p><a href="/">Go to Mah Buddy <span>↗</span></a></section>

      <footer className="guide-footer"><a href="/" className="footer-brand"><span className="brand-logo">m<span>.</span></span> mah buddy</a><span>Made for curious minds.</span><div><a href="/privacy-policy">Privacy</a><a href="/terms-of-service">Terms</a><a href="/about-mah-buddy">About</a></div><small>© {new Date().getFullYear()} Mah Buddy · ZED_RO Corp.</small></footer>

      <style jsx>{`
        .guide-page{min-height:100vh;position:relative;overflow:hidden;background:#101713;color:#eef7f1;padding:0 24px 30px;--accent:#b9e8f4;--muted:#9aaba1;--surface:#18221c;--border:rgba(222,242,232,.12)}
        .guide-glow{position:absolute;z-index:0;pointer-events:none;top:-280px;left:50%;transform:translateX(-50%);width:min(1050px,120vw);height:650px;background:radial-gradient(ellipse,rgba(57,111,82,.25),rgba(16,23,19,0) 68%)}
        .guide-header,.guide-hero,.features-section,.closing-card,.guide-footer{position:relative;z-index:1}
        .guide-header{max-width:1160px;margin:auto;height:82px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(222,242,232,.09)}
        .brand-lockup,.footer-brand{display:inline-flex;align-items:center;gap:10px;color:#f0f7f2;text-decoration:none;font-size:15px;font-weight:750;letter-spacing:-.03em}
        .brand-logo{display:inline-grid;place-items:center;position:relative;width:34px;height:34px;border-radius:11px;background:#174c39;color:#f5fff9;font-size:26px;line-height:1;font-weight:850;letter-spacing:-.09em}.brand-logo span{color:#ff986e;font-size:19px;position:absolute;top:0px;right:5px}
        .header-link{font-size:12px;text-decoration:none;color:#dcece2;border:1px solid var(--border);padding:11px 15px;border-radius:100px}.header-link span{color:var(--accent);margin-left:6px}
        .guide-hero{max-width:1000px;margin:0 auto;padding:88px 0 70px;text-align:center}
        .hero-kicker,.section-kicker{font-size:10px;letter-spacing:.18em;font-weight:800;color:#b6c9bc}.hero-kicker{display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid var(--border);border-radius:100px;background:rgba(255,255,255,.025)}.hero-kicker span,.visual-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px rgba(185,232,244,.45)}
        .guide-hero h1{font-size:clamp(43px,7vw,82px);line-height:.99;letter-spacing:-.075em;font-weight:760;margin:25px 0 22px}.guide-hero h1 span{color:var(--accent)}
        .guide-hero>p{max-width:580px;margin:0 auto;color:#aebdb3;font-size:15px;line-height:1.85}
        .hero-actions{display:flex;align-items:center;justify-content:center;gap:17px;margin-top:28px}.hero-actions>a,.closing-card>a{background:var(--accent);color:#17352e;text-decoration:none;font-weight:800;font-size:12px;padding:13px 17px;border-radius:100px}.hero-actions>a span,.closing-card>a span{margin-left:10px}.hero-note{font-size:11px;color:#84968a}
        .hero-stats{display:flex;align-items:center;justify-content:center;gap:31px;margin-top:65px}.hero-stats div{display:flex;flex-direction:column;gap:5px;text-align:left}.hero-stats strong{font-size:13px}.hero-stats span{font-size:10px;color:#91a298}.hero-stats>i{height:28px;width:1px;background:var(--border)}
        .features-section{max-width:1120px;margin:0 auto;padding:42px 0 80px;border-top:1px solid rgba(222,242,232,.09)}
        .section-intro{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:35px}.section-kicker{color:#8ca99a}.section-intro h2{font-size:clamp(27px,4vw,42px);letter-spacing:-.055em;line-height:1.1;margin:12px 0 0}.section-intro>p{max-width:365px;color:#8fa197;font-size:11px;line-height:1.8;margin:0}
        .feature-list{display:flex;flex-direction:column;gap:20px}.feature-card{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:clamp(28px,6vw,78px);padding:26px;border:1px solid var(--border);border-radius:26px;background:linear-gradient(125deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:0 18px 50px rgba(0,0,0,.09)}.feature-card.reverse .feature-visual{order:2}.feature-card.reverse .feature-copy{order:1}
        .feature-visual{min-width:0;padding:5px 7px 9px}.visual-label{display:flex;align-items:center;gap:7px;color:#8da196;font-size:8px;letter-spacing:.13em;font-weight:800;margin:0 0 13px 5px}.visual-index{margin-left:auto;color:#708277}
        .preview-shell{width:100%;max-width:435px;min-height:300px;margin:auto;overflow:hidden;border:1px solid rgba(205,237,220,.15);border-radius:20px;background:#111b15;box-shadow:0 20px 45px rgba(0,0,0,.25),inset 0 1px rgba(255,255,255,.03);color:#ecf6ef}.preview-topbar{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid rgba(222,242,232,.08);background:rgba(255,255,255,.015)}.preview-brand{display:flex;align-items:center;gap:7px;font-size:9px;font-weight:800;letter-spacing:-.02em}.preview-mark{font-size:16px;font-weight:900;color:#f4fff8;position:relative}.preview-mark span{color:#ff986e}.preview-top-dots{display:flex;gap:4px}.preview-top-dots i{width:4px;height:4px;background:#4e6858;border-radius:50%}.preview-content{padding:20px 19px 18px;min-height:240px}.preview-eyebrow{font-size:7px;letter-spacing:.16em;color:#8aa797;font-weight:850;margin-bottom:9px}.preview-heading{font-size:19px;line-height:1.18;letter-spacing:-.045em;font-weight:750}.preview-sub{font-size:9px;line-height:1.6;color:#91a59a;margin-top:7px}.preview-input{height:32px;border:1px solid rgba(222,242,232,.12);border-radius:11px;margin-top:14px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;color:#778a7d;font-size:8px}.preview-input span{display:grid;place-items:center;background:var(--accent);color:#16372d;width:20px;height:20px;border-radius:7px;font-size:11px}.chat-bubble{display:flex;gap:7px;max-width:94%;padding:9px 10px;border-radius:12px;font-size:9px;line-height:1.55;margin-top:13px}.user-bubble{margin-left:auto;background:#26392d;color:#e2eee5;border-bottom-right-radius:4px}.buddy-bubble{background:#1b2920;color:#c5d8ca;border:1px solid rgba(185,232,244,.08);border-bottom-left-radius:4px}.tiny-orb{color:var(--accent)}
        .preview-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:22px}.preview-mini-grid>div{display:flex;flex-direction:column;gap:7px;min-height:83px;padding:10px 8px;border:1px solid rgba(222,242,232,.1);border-radius:12px;background:rgba(255,255,255,.02)}.mini-symbol{font-size:17px;color:var(--accent)}.preview-mini-grid strong{font-size:9px}.preview-mini-grid small{font-size:7px;line-height:1.4;color:#8da195}
        .preview-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.preview-pill{border:1px solid rgba(185,232,244,.18);border-radius:100px;padding:5px 8px;color:var(--accent);font-size:7px;font-weight:800;letter-spacing:.08em}.preview-count{font-size:8px;color:#8da195}.answer-option{display:flex;align-items:center;gap:9px;padding:9px 10px;margin-top:7px;border:1px solid rgba(222,242,232,.1);border-radius:9px;font-size:9px;color:#c2d2c7}.answer-option>span{display:grid;place-items:center;width:17px;height:17px;border-radius:5px;background:#25362b;font-size:8px}.answer-option.selected{border-color:rgba(185,232,244,.5);background:rgba(185,232,244,.07);color:#effbf3}.answer-option b{margin-left:auto;color:var(--accent)}.preview-progress{height:3px;background:#28372c;border-radius:10px;margin-top:15px;overflow:hidden}.preview-progress span{display:block;width:25%;height:100%;background:var(--accent);border-radius:10px}
        .flashcard-visual{margin-top:16px;min-height:142px;border:1px solid rgba(185,232,244,.2);border-radius:15px;background:radial-gradient(ellipse at top right,rgba(72,126,92,.25),transparent 60%),#1b2a20;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:14px}.flashcard-star{font-size:16px;color:var(--accent)}.flashcard-visual small{font-size:6px;letter-spacing:.16em;color:#93aa9a;margin:8px 0}.flashcard-visual strong{font-size:17px;letter-spacing:-.04em}.flashcard-hint{font-size:8px;color:#9bad9f;margin-top:8px}.flashcard-button{font-size:8px;color:#18372d;background:var(--accent);padding:7px 11px;border-radius:100px;margin-top:12px;font-weight:800}.preview-card-dots{display:flex;justify-content:center;gap:5px;margin-top:12px}.preview-card-dots i{width:4px;height:4px;background:#445b49;border-radius:5px}.preview-card-dots i.on{width:14px;background:var(--accent)}
        .library-item,.setting-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(222,242,232,.08)}.library-item:first-of-type{margin-top:10px}.library-icon{display:grid;place-items:center;width:31px;height:31px;border-radius:9px;background:#294334;color:#b6e7c5}.library-icon.blue{background:#20383d;color:#a5e7f1}.library-icon.gold{background:#3a3424;color:#f4d79a}.library-item>span:nth-child(2),.setting-row>span:nth-child(2){display:flex;flex-direction:column;gap:4px;min-width:0}.library-item strong,.setting-row strong{font-size:9px}.library-item small,.setting-row small{font-size:7px;color:#8da195}.library-item>b,.setting-row>b{margin-left:auto;color:#7f9587;font-size:14px}
        .voice-orbit{position:relative;width:92px;height:92px;margin:17px auto 8px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(185,232,244,.18),rgba(185,232,244,.02) 60%,transparent 70%);border:1px solid rgba(185,232,244,.16)}.voice-orbit:before,.voice-orbit:after{content:"";position:absolute;inset:10px;border:1px solid rgba(185,232,244,.15);border-radius:50%}.voice-orbit:after{inset:-6px;border-style:dashed;border-color:rgba(185,232,244,.13)}.voice-orbit>b{display:grid;place-items:center;width:39px;height:39px;background:var(--accent);border-radius:50%;font-size:17px}.voice-orbit>span{position:absolute;width:5px;height:5px;background:var(--accent);border-radius:50%;top:12px;right:18px}.voice-orbit>span:nth-child(2){top:auto;right:auto;bottom:16px;left:9px}.voice-orbit>span:nth-child(3){top:36px;right:auto;left:3px}.voice-orbit>span:nth-child(4){top:auto;bottom:8px;right:29px}.voice-caption{text-align:center;color:#a8b9ae;font-size:8px}.voice-wave{display:flex;align-items:center;justify-content:center;gap:3px;height:34px;margin-top:4px}.voice-wave i{display:block;width:3px;border-radius:5px;background:#80bba2;opacity:.85}
        .profile-hero{display:flex;flex-direction:column;align-items:center;margin:15px 0 14px}.profile-avatar{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:linear-gradient(140deg,#3e7656,#1f4634);border:1px solid rgba(185,232,244,.25);font-size:19px;font-weight:800;color:#e7f8ed;margin-bottom:8px}.profile-hero strong{font-size:11px}.profile-hero small{font-size:8px;color:#8da195;margin-top:4px}.profile-field{display:flex;flex-direction:column;position:relative;gap:4px;padding:10px 11px;margin-top:7px;border:1px solid rgba(222,242,232,.09);border-radius:10px}.profile-field small{font-size:6px;letter-spacing:.13em;color:#8da195}.profile-field strong{font-size:9px}.profile-field span{position:absolute;right:12px;top:14px;color:#819487}
        .setting-row{padding:12px 0}.setting-icon{display:grid;place-items:center;width:29px;height:29px;background:#26392c;border-radius:9px;color:var(--accent);font-size:13px;font-weight:700}
        .preview-bottom{height:25px;border-top:1px solid rgba(222,242,232,.07);display:flex;align-items:center;justify-content:center;gap:25px}.preview-bottom span{width:13px;height:3px;border-radius:10px;background:#3a4c3f}.preview-bottom span:nth-child(2){background:var(--accent)}
        .feature-copy{padding:12px 5px}.feature-number{font-size:9px;letter-spacing:.14em;color:#8ba394;font-weight:850}.feature-copy h3{font-size:clamp(26px,3vw,38px);line-height:1.08;letter-spacing:-.06em;margin:12px 0 8px}.feature-tag{font-size:12px;font-weight:750;color:var(--accent);margin:0 0 13px}.feature-description{font-size:12px;line-height:1.9;color:#a4b4a9;margin:0;max-width:490px}.how-to{margin-top:21px}.how-to-label{font-size:8px;letter-spacing:.14em;font-weight:850;color:#81988a}.step-line{display:flex;align-items:flex-start;gap:10px;margin-top:10px}.step-line>span{flex:none;display:grid;place-items:center;width:19px;height:19px;border:1px solid rgba(185,232,244,.2);border-radius:7px;color:var(--accent);font-size:8px;font-weight:800}.step-line p{font-size:10px;line-height:1.6;color:#c5d2c9;margin:1px 0 0}.feature-link{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-size:10px;font-weight:800;color:#142e25;background:#d6f2df;border-radius:100px;padding:11px 14px;margin-top:22px}.feature-link span{color:#2b7560}
        .closing-card{max-width:1120px;margin:0 auto 70px;padding:50px 20px;text-align:center;border:1px solid rgba(185,232,244,.17);border-radius:27px;background:radial-gradient(ellipse at 50% 0%,rgba(72,125,89,.22),transparent 65%),#17221b}.closing-orb{display:grid;place-items:center;width:42px;height:42px;border-radius:15px;margin:0 auto 20px;background:rgba(185,232,244,.1);color:var(--accent);font-size:21px}.closing-card h2{font-size:clamp(29px,4vw,45px);letter-spacing:-.06em;line-height:1.08;margin:13px 0}.closing-card>p{max-width:400px;margin:0 auto 22px;font-size:12px;line-height:1.8;color:#9eafa4}.guide-footer{max-width:1120px;margin:auto;padding:24px 0 0;border-top:1px solid var(--border);display:flex;align-items:center;gap:20px;flex-wrap:wrap}.footer-brand{font-size:11px}.footer-brand .brand-logo{width:25px;height:25px;font-size:19px;border-radius:8px}.footer-brand .brand-logo span{font-size:14px;right:4px}.guide-footer>span{font-size:10px;color:#829388}.guide-footer>div{display:flex;gap:17px;margin-left:auto}.guide-footer a{font-size:10px;color:#a9b9af;text-decoration:none}.guide-footer>small{width:100%;font-size:9px;color:#65776a;margin-top:4px}
        @media(max-width:760px){.guide-page{padding-left:15px;padding-right:15px}.guide-header{height:69px}.guide-hero{padding:66px 0 52px}.guide-hero h1{font-size:clamp(42px,11vw,65px)}.guide-hero>p{font-size:13px;padding:0 5px}.hero-stats{gap:14px;margin-top:48px}.hero-stats span{max-width:95px;font-size:9px}.hero-stats strong{font-size:11px}.section-intro{align-items:flex-start;flex-direction:column;gap:12px}.section-intro>p{max-width:510px}.feature-card{grid-template-columns:1fr;gap:22px;padding:18px;border-radius:22px}.feature-card.reverse .feature-visual,.feature-card.reverse .feature-copy{order:initial}.feature-visual{padding:0}.preview-shell{max-width:500px}.feature-copy{padding:3px 2px}.feature-copy h3{font-size:31px}.feature-description{font-size:12px}.features-section{padding-bottom:55px}.closing-card{margin-bottom:48px;padding:42px 18px}.guide-footer{gap:13px}.guide-footer>div{margin-left:0}.guide-footer>span{margin-left:auto}}
        @media(max-width:390px){.header-link{font-size:10px;padding:10px}.brand-lockup{font-size:13px}.brand-logo{width:30px;height:30px}.hero-actions{flex-direction:column;gap:10px}.hero-stats{gap:9px}.hero-stats span{max-width:82px;font-size:8px}.feature-card{padding:13px}.preview-content{padding:17px 13px}.guide-footer>span{display:none}}
      `}</style>
    </main>
  );
}
