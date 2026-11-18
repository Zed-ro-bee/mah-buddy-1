"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "EXPLORE SOMETHING NEW",
    title: "A world of ideas,\nwaiting for you.",
    description: "Find clear explanations and fresh ways to understand the things you study.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=88",
    position: "center 46%",
    href: "/library",
    action: "Explore resources",
    accent: "forest",
  },
  {
    eyebrow: "MAKE KNOWLEDGE STICK",
    title: "Turn learning\ninto a habit.",
    description: "Build confidence with focused practice, one idea at a time.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=88",
    position: "center 44%",
    href: "/flashcards",
    action: "Create flashcards",
    accent: "coral",
  },
  {
    eyebrow: "GROW AT YOUR PACE",
    title: "See what you\ncan achieve.",
    description: "Check your understanding and keep moving towards your goals.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=88",
    position: "center 54%",
    href: "/quiz",
    action: "Try a quiz",
    accent: "sage",
  },
];

const tools = [
  { title: "Flashcards", description: "Remember the important details", href: "/flashcards", icon: "cards", tone: "green" },
  { title: "Quizzes", description: "Check what you understand", href: "/quiz", icon: "quiz", tone: "coral" },
  { title: "Resources", description: "Keep your learning in one place", href: "/library", icon: "library", tone: "sage" },
  { title: "Study planner", description: "Give your goals a little structure", href: "/study/planner", icon: "calendar", tone: "sand" },
];

function Icon({ name, size = 22 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    profile: <><circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    cards: <><rect x="5" y="4" width="13" height="16" rx="2.2"/><path d="M9 8h5M9 12h5M19 8v10a2 2 0 0 1-2 2"/></>,
    quiz: <><path d="M8.5 12.5 11 15l5-6"/><circle cx="12" cy="12" r="9"/></>,
    library: <><path d="M4 5.5c2.8-1.2 5.5-.7 8 1.1v13c-2.5-1.8-5.2-2.3-8-1.1z"/><path d="M20 5.5c-2.8-1.2-5.5-.7-8 1.1v13c2.5-1.8 5.2-2.3 8-1.1z"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"/></>,
    orbit: <><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(35 12 12)"/></>,
    leaf: <><path d="M20 4C11 4 5 7.5 5 14a6 6 0 0 0 6 6c6.5 0 9-7 9-16Z"/><path d="M4 21c3-5 7-8 12-11"/></>,
    book: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22z"/><path d="M5 4.5v15A2.5 2.5 0 0 1 7.5 17H20"/></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

export default function StudyPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStart = useRef(null);
  const slide = slides[activeSlide];

  const moveSlide = useCallback((direction) => {
    setActiveSlide(current => (current + direction + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % slides.length), 6200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="mb-home-v2">
      <header className="mb-home-v2-header">
        <a href="/study" className="mb-home-v2-brand" aria-label="Mah Buddy home">
          <img src="/mah-buddy-logo.svg" alt="" width="40" height="40" />
          <span><strong>mah buddy</strong><small>YOUR LEARNING SPACE</small></span>
        </a>
        <a href="/profile" className="mb-home-v2-profile" aria-label="Open profile"><Icon name="profile" size={21}/></a>
      </header>

      <div className="mb-home-v2-content">
        <section className="mb-home-v2-welcome">
          <span className="mb-home-v2-kicker"><i/> A SPACE TO LEARN AND GROW</span>
          <h1>Good to have<br/><em>you here.</em></h1>
          <p>Make room for new ideas. Take learning at your own pace.</p>
        </section>

        <section
          className={`mb-home-v2-showcase accent-${slide.accent}`}
          aria-label="Learning inspiration"
          aria-roledescription="carousel"
          onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (touchStart.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 42) moveSlide(delta < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <div className="mb-home-v2-showcase-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(10,28,19,.84) 0%,rgba(10,28,19,.54) 48%,rgba(10,28,19,.08) 100%),linear-gradient(0deg,rgba(10,28,19,.24),transparent 58%),url("${slide.image}")`, backgroundPosition: `center,center,${slide.position}` }} />
          <div className="mb-home-v2-showcase-content" key={activeSlide}>
            <span className="mb-home-v2-showcase-eyebrow">{slide.eyebrow}</span>
            <h2>{slide.title.split(String.fromCharCode(10)).map((line, index) => <span key={index}>{line}</span>)}</h2>
            <p>{slide.description}</p>
            <a href={slide.href} className="mb-home-v2-showcase-cta">{slide.action}<span aria-hidden="true">↗</span></a>
          </div>
          <div className="mb-home-v2-pagination" aria-label="Choose featured story">
            {slides.map((item, index) => <button key={item.title} type="button" onClick={() => setActiveSlide(index)} className={index === activeSlide ? "active" : ""} aria-label={`Show ${item.eyebrow.toLowerCase()}`} aria-current={index === activeSlide ? "true" : undefined}/>)}
          </div>
        </section>

        <section className="mb-home-v2-tools">
          <div className="mb-home-v2-section-heading">
            <div><span>YOUR LEARNING TOOLS</span><h2>Where would you like to begin?</h2></div>
          </div>
          <div className="mb-home-v2-tool-list">
            {tools.map(item => (
              <a href={item.href} className="mb-home-v2-tool" key={item.title}>
                <span className={`mb-home-v2-tool-icon ${item.tone}`}><Icon name={item.icon} size={23}/></span>
                <span className="mb-home-v2-tool-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                <span className="mb-home-v2-tool-end" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <a href="/" className="mb-home-v2-ai">
          <span className="mb-home-v2-ai-art"><Icon name="orbit" size={27}/></span>
          <span className="mb-home-v2-ai-copy"><small>YOUR AI STUDY COMPANION</small><strong>Need a hand with something?</strong><span>Ask Mah Buddy and work through it together.</span></span>
          <span className="mb-home-v2-ai-action">Open AI Assistance</span>
        </a>

        <section className="mb-home-v2-journey">
          <span className="mb-home-v2-journey-art"><Icon name="leaf" size={23}/></span>
          <div><small>YOUR LEARNING JOURNEY</small><strong>Progress grows with every session.</strong><p>Your activity and milestones will take shape here as you learn.</p></div>
        </section>
      </div>

      <style jsx>{`
        .mb-home-v2{--forest:#174B35;--forest-deep:#103B2A;--coral:#E87950;--sage:#DDE9DE;--ink:#17231C;--muted:#718077;--line:#E4EAE4;min-height:100dvh;padding:0 0 calc(118px + env(safe-area-inset-bottom));overflow:hidden;background:#F6F8F5;color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .mb-home-v2-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;min-height:70px;padding:0 max(18px,calc((100vw - 860px)/2));border-bottom:1px solid rgba(28,65,43,.08);background:rgba(250,252,249,.88);backdrop-filter:blur(24px) saturate(170%)}
        .mb-home-v2-brand{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none}
        .mb-home-v2-brand img{display:block;width:40px;height:40px;object-fit:contain}
        .mb-home-v2-brand>span{display:flex;flex-direction:column;gap:3px}
        .mb-home-v2-brand strong{font-size:16px;letter-spacing:-.045em;font-weight:760}
        .mb-home-v2-brand small{font-size:8px;letter-spacing:.14em;color:#7C8980;font-weight:750}
        .mb-home-v2-profile{display:grid;place-items:center;width:41px;height:41px;border:1px solid var(--line);border-radius:15px;background:#fff;color:var(--forest);text-decoration:none;box-shadow:0 2px 8px rgba(20,48,29,.035);transition:background .2s,border-color .2s,transform .2s}
        .mb-home-v2-profile:hover{background:#EDF4EE;border-color:#C9D9CC;transform:translateY(-1px)}
        .mb-home-v2-content{width:min(100%,860px);margin:0 auto;padding:32px 22px 34px}
        .mb-home-v2-welcome{margin:5px 0 25px}
        .mb-home-v2-kicker{display:flex;align-items:center;gap:9px;color:var(--forest);font-size:9px;font-weight:780;letter-spacing:.15em}
        .mb-home-v2-kicker i{width:7px;height:7px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 4px rgba(232,121,80,.11)}
        .mb-home-v2-welcome h1{margin:14px 0 9px;font-size:clamp(38px,7vw,54px);font-weight:650;line-height:.99;letter-spacing:-.075em}
        .mb-home-v2-welcome h1 em{font-style:normal;color:var(--forest)}
        .mb-home-v2-welcome p{max-width:390px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}
        .mb-home-v2-showcase{position:relative;isolation:isolate;min-height:330px;overflow:hidden;border-radius:28px;background:#183B2B;box-shadow:0 18px 48px rgba(23,55,34,.15);touch-action:pan-y}
        .mb-home-v2-showcase-image{position:absolute;inset:0;z-index:-1;background-size:cover;background-repeat:no-repeat;transition:background-position .4s ease}
        .mb-home-v2-showcase:after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 88% 12%,rgba(255,255,255,.13),transparent 36%)}
        .mb-home-v2-showcase-content{position:relative;display:flex;flex-direction:column;align-items:flex-start;max-width:470px;padding:44px 34px 48px;color:#fff;animation:mb-home-v2-enter .42s ease both}
        .mb-home-v2-showcase-eyebrow{margin-bottom:13px;color:#D5E9D9;font-size:9px;font-weight:780;letter-spacing:.16em}
        .mb-home-v2-showcase h2{display:flex;flex-direction:column;margin:0 0 11px;font-size:clamp(31px,5.7vw,43px);font-weight:680;line-height:1.02;letter-spacing:-.065em;text-wrap:balance}
        .mb-home-v2-showcase p{max-width:340px;margin:0 0 22px;color:rgba(249,252,249,.84);font-size:12px;line-height:1.65}
        .mb-home-v2-showcase-cta{display:inline-flex;align-items:center;gap:18px;min-height:43px;padding:0 16px;border:1px solid rgba(255,255,255,.34);border-radius:13px;background:rgba(250,252,249,.96);color:var(--forest-deep);text-decoration:none;font-size:11px;font-weight:760;box-shadow:0 5px 18px rgba(0,0,0,.12);transition:transform .2s,background .2s}
        .mb-home-v2-showcase-cta span{font-size:17px;font-weight:500;line-height:1}
        .mb-home-v2-showcase-cta:hover{transform:translateY(-2px);background:#fff}
        .mb-home-v2-pagination{position:absolute;right:25px;bottom:23px;display:flex;align-items:center;gap:7px}
        .mb-home-v2-pagination button{width:19px;height:3px;padding:0;border:0;border-radius:9px;background:rgba(255,255,255,.48);transition:width .25s,background .25s}
        .mb-home-v2-pagination button.active{width:34px;background:#fff}
        .mb-home-v2-tools{margin-top:37px}
        .mb-home-v2-section-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:13px}
        .mb-home-v2-section-heading>div>span{color:var(--forest);font-size:8px;font-weight:800;letter-spacing:.16em}
        .mb-home-v2-section-heading h2{margin:6px 0 0;font-size:clamp(20px,4vw,24px);font-weight:650;letter-spacing:-.05em}
        .mb-home-v2-tool-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .mb-home-v2-tool{display:flex;align-items:center;gap:12px;min-width:0;min-height:78px;padding:13px;border:1px solid var(--line);border-radius:17px;background:#fff;color:var(--ink);text-decoration:none;box-shadow:0 3px 13px rgba(25,49,31,.025);transition:transform .2s,border-color .2s,box-shadow .2s}
        .mb-home-v2-tool:hover{transform:translateY(-2px);border-color:#C9D9CC;box-shadow:0 8px 22px rgba(25,49,31,.06)}
        .mb-home-v2-tool-icon{display:grid;place-items:center;flex:0 0 43px;width:43px;height:43px;border-radius:14px}
        .mb-home-v2-tool-icon.green{background:#EAF2EB;color:var(--forest)}
        .mb-home-v2-tool-icon.coral{background:#FFF0E9;color:#C45E3C}
        .mb-home-v2-tool-icon.sage{background:#EEF3EC;color:#54745A}
        .mb-home-v2-tool-icon.sand{background:#F5F0E7;color:#8B7147}
        .mb-home-v2-tool-copy{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}
        .mb-home-v2-tool-copy strong{font-size:12px;font-weight:730;letter-spacing:-.02em}
        .mb-home-v2-tool-copy small{color:var(--muted);font-size:9px;line-height:1.4}
        .mb-home-v2-tool-end{align-self:flex-start;color:#A2ADA4;font-size:15px;line-height:1}
        .mb-home-v2-ai{display:flex;align-items:center;gap:15px;margin-top:17px;padding:17px;border:1px solid #D9E6DA;border-radius:20px;background:linear-gradient(110deg,#EAF3EB,#F4F7F2 72%,#F9F3EC);color:var(--ink);text-decoration:none;transition:transform .2s,border-color .2s}
        .mb-home-v2-ai:hover{transform:translateY(-2px);border-color:#BBD2BE}
        .mb-home-v2-ai-art{display:grid;place-items:center;flex:0 0 49px;width:49px;height:49px;border:1px solid #C6DCC9;border-radius:16px;background:#DDEBDD;color:var(--forest)}
        .mb-home-v2-ai-copy{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}
        .mb-home-v2-ai-copy small{color:var(--forest);font-size:8px;font-weight:800;letter-spacing:.14em}
        .mb-home-v2-ai-copy strong{font-size:14px;font-weight:730;letter-spacing:-.025em}
        .mb-home-v2-ai-copy>span{color:#68766C;font-size:10px;line-height:1.45}
        .mb-home-v2-ai-action{padding:9px 11px;border:1px solid #C9D9CC;border-radius:11px;background:rgba(255,255,255,.64);color:var(--forest);font-size:9px;font-weight:750;white-space:nowrap}
        .mb-home-v2-journey{display:flex;align-items:center;gap:13px;margin-top:14px;padding:16px 17px;border:1px solid var(--line);border-radius:18px;background:#fff}
        .mb-home-v2-journey-art{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:14px;background:#F0F4ED;color:#58765B}
        .mb-home-v2-journey>div{display:flex;flex-direction:column;gap:4px;min-width:0}
        .mb-home-v2-journey small{color:#7A887D;font-size:8px;font-weight:800;letter-spacing:.13em}
        .mb-home-v2-journey strong{font-size:12px;font-weight:700}
        .mb-home-v2-journey p{margin:0;color:var(--muted);font-size:10px;line-height:1.45}
        @keyframes mb-home-v2-enter{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
        @media(min-width:760px){.mb-home-v2-content{padding:42px 30px 44px}.mb-home-v2-showcase{min-height:360px}.mb-home-v2-showcase-content{padding:53px 42px 55px}.mb-home-v2-tools{margin-top:43px}.mb-home-v2-tool-list{gap:12px}.mb-home-v2-tool{min-height:86px;padding:15px 16px}.mb-home-v2-ai{padding:20px 21px}}
        @media(max-width:520px){.mb-home-v2-content{padding:27px 15px 28px}.mb-home-v2-welcome{margin-bottom:21px}.mb-home-v2-welcome h1{font-size:clamp(37px,10vw,47px)}.mb-home-v2-showcase{min-height:310px;border-radius:23px}.mb-home-v2-showcase-content{padding:37px 22px 47px}.mb-home-v2-showcase h2{font-size:clamp(29px,8vw,37px)}.mb-home-v2-showcase p{max-width:285px;font-size:11px}.mb-home-v2-pagination{right:20px;bottom:20px}.mb-home-v2-tools{margin-top:31px}.mb-home-v2-tool-list{gap:8px}.mb-home-v2-tool{gap:9px;min-height:75px;padding:10px}.mb-home-v2-tool-icon{flex-basis:38px;width:38px;height:38px;border-radius:12px}.mb-home-v2-tool-copy strong{font-size:11px}.mb-home-v2-tool-copy small{font-size:8px}.mb-home-v2-ai{gap:11px;padding:14px}.mb-home-v2-ai-art{flex-basis:42px;width:42px;height:42px;border-radius:13px}.mb-home-v2-ai-copy strong{font-size:12px}.mb-home-v2-ai-copy>span{font-size:9px}.mb-home-v2-ai-action{padding:8px;font-size:8px}}
        @media(max-width:370px){.mb-home-v2-tool-list{grid-template-columns:1fr}.mb-home-v2-ai{flex-wrap:wrap}.mb-home-v2-ai-action{margin-left:53px}.mb-home-v2-showcase{min-height:300px}}
        @media(prefers-reduced-motion:reduce){.mb-home-v2 *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
      `}</style>
    </main>
  );
}
