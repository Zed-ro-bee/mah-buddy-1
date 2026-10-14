"use client";

import { useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "YOUR NEXT CHAPTER",
    title: "Make today count.",
    description: "Small steps. Bigger understanding.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
    position: "center 46%",
    tone: "green",
  },
  {
    eyebrow: "LEARN WITH CONFIDENCE",
    title: "Curiosity takes you further.",
    description: "Explore ideas, one question at a time.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=85",
    position: "center 44%",
    tone: "blue",
  },
  {
    eyebrow: "YOUR FUTURE STARTS HERE",
    title: "Build a little momentum.",
    description: "Your goals. Your pace. Your next step.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",
    position: "center 54%",
    tone: "violet",
  },
];

const workspace = [
  { title: "Flashcards", caption: "Learn it. Remember it.", href: "/flashcards", icon: "cards", image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=700&q=80", tone: "forest" },
  { title: "Quizzes", caption: "Challenge your mind.", href: "/quiz", icon: "quiz", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80", tone: "ocean" },
  { title: "Resources", caption: "Keep everything close.", href: "/library", icon: "library", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=80", tone: "amber" },
  { title: "Study Planner", caption: "Make time for your goals.", href: "/study/planner", icon: "planner", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=80", tone: "plum" },
];

function Icon({ name, size = 22 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5.5 9v11h13V9"/><path d="M9.5 20v-6h5v6"/></>,
    orbit: <><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(35 12 12)"/></>,
    cards: <><rect x="5" y="4" width="13" height="16" rx="2"/><path d="M9 8h5M9 12h5"/><path d="M19 7v12a2 2 0 0 1-2 2"/></>,
    quiz: <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
    library: <><path d="M3 5.5c3-1.3 6-.8 9 1.2v13c-3-2-6-2.5-9-1.2z"/><path d="M21 5.5c-3-1.3-6-.8-9 1.2v13c3-2 6-2.5 9-1.2z"/></>,
    planner: <><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

export default function StudyPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStart = useRef(null);
  const slide = slides[activeSlide];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  const moveSlide = (direction) => setActiveSlide(current => (current + direction + slides.length) % slides.length);

  return (
    <main className="home-page">
      <header className="home-header">
        <a href="/" className="home-brand" aria-label="Mah Buddy AI Assistance">
          <span className="home-brand-mark"><Icon name="spark" size={21}/></span>
          <span><strong>mah buddy</strong><small>YOUR AI STUDY COMPANION</small></span>
        </a>
        <a href="/profile" className="profile-shortcut" aria-label="Open profile"><Icon name="user" size={21}/></a>
      </header>

      <section className="home-content">
        <div className="welcome-copy">
          <span className="home-eyebrow"><span className="eyebrow-pulse"/> A NEW DAY TO GROW</span>
          <h1>Your potential<br/><em>has no limits.</em></h1>
          <p>Learn at your pace. Build your future.</p>
        </div>

        <section
          className={`feature-carousel tone-${slide.tone}`}
          aria-label="Featured learning carousel"
          aria-roledescription="carousel"
          onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (touchStart.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 45) moveSlide(delta < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <div className="carousel-photo" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,22,16,.86) 0%,rgba(8,22,16,.55) 48%,rgba(8,22,16,.08) 100%),linear-gradient(0deg,rgba(8,22,16,.4),transparent 55%),url("${slide.image}")`, backgroundPosition: `center,center,${slide.position}` }} />
          <div className="carousel-glow"/>
          <div className="carousel-copy" key={activeSlide}>
            <span className="carousel-eyebrow">{slide.eyebrow}</span>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            <a href="/" className="carousel-cta">Start learning <Icon name="arrow" size={17}/></a>
          </div>
          <div className="carousel-topline"><span>MAH BUDDY / INSPIRE</span><span>{String(activeSlide + 1).padStart(2,"0")} <i>/ 03</i></span></div>
          <button className="carousel-arrow previous" onClick={() => moveSlide(-1)} aria-label="Previous slide"><span>‹</span></button>
          <button className="carousel-arrow next" onClick={() => moveSlide(1)} aria-label="Next slide"><span>›</span></button>
          <div className="carousel-dots" aria-label="Choose carousel slide">
            {slides.map((item, index) => <button key={item.title} className={index === activeSlide ? "selected" : ""} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === activeSlide ? "true" : undefined}/>)}
          </div>
        </section>

        <section className="workspace-section">
          <div className="section-heading"><div><span className="section-kicker">MADE FOR YOUR MOMENT</span><h2>Your workspace</h2></div><a href="/study/planner">Plan your week <Icon name="arrow" size={15}/></a></div>
          <div className="workspace-grid">
            {workspace.map((item, index) => (
              <a href={item.href} className={`workspace-card ${item.tone}`} key={item.title} style={{ "--card-index": index }}>
                <div className="workspace-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(9,20,14,.04) 10%,rgba(9,20,14,.78) 100%),url("${item.image}")` }} />
                <span className="workspace-icon"><Icon name={item.icon} size={20}/></span>
                <span className="workspace-card-copy"><strong>{item.title}</strong><small>{item.caption}</small></span>
                <span className="workspace-arrow"><Icon name="arrow" size={17}/></span>
              </a>
            ))}
          </div>
        </section>

        <a href="/" className="ai-companion-card">
          <div className="ai-orbit-art" aria-hidden="true"><span/><i/><b/></div>
          <div className="ai-companion-copy"><span>YOUR STUDY PARTNER</span><strong>Big question? Ask your buddy.</strong><small>Get clear explanations, one step at a time.</small></div>
          <span className="ai-companion-arrow"><Icon name="arrow" size={19}/></span>
        </a>

        <section className="progress-card">
          <div className="progress-art"><Icon name="spark" size={27}/><span/><i/></div>
          <div className="progress-copy"><span>YOUR LEARNING JOURNEY</span><strong>Your next chapter starts here.</strong><p>Complete your first study session and your progress will show up here.</p></div>
          <a href="/quiz" aria-label="Start your first quiz"><Icon name="arrow" size={19}/></a>
        </section>
      </section>


      <style jsx>{`
        :global(*){box-sizing:border-box}
        .home-page{--ice:#B9E8F4;min-height:100dvh;padding:0 0 calc(110px + env(safe-area-inset-bottom));overflow:hidden;background:#101713;color:#F3F8F4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .home-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;min-height:72px;padding:0 max(18px,calc((100vw - 780px)/2));border-bottom:1px solid rgba(190,225,202,.09);background:rgba(16,23,19,.9);backdrop-filter:blur(22px) saturate(145%)}
        .home-brand{display:flex;align-items:center;gap:11px;color:#F3F8F4;text-decoration:none}
        .home-brand-mark{display:grid;place-items:center;width:41px;height:41px;border-radius:14px;background:linear-gradient(145deg,#D5F6E0,#B9E8F4);color:#153B2E;box-shadow:0 5px 20px rgba(185,232,244,.13)}
        .home-brand>span:last-child{display:flex;flex-direction:column;gap:3px}
        .home-brand strong{font-size:16px;letter-spacing:-.035em;font-weight:780}
        .home-brand small{font-size:8px;letter-spacing:.13em;color:#9BAFA3;font-weight:750}
        .profile-shortcut{display:grid;place-items:center;width:41px;height:41px;border:1px solid #33483A;border-radius:15px;background:linear-gradient(145deg,#24382B,#19261E);color:#DCEBE0;text-decoration:none}
        .profile-shortcut:hover{border-color:var(--ice);color:var(--ice)}
        .home-content{width:min(100%,780px);margin:0 auto;padding:28px 18px 25px}
        .welcome-copy{margin:5px 0 23px}
        .home-eyebrow{display:flex;align-items:center;gap:8px;color:var(--ice);font-size:9px;font-weight:850;letter-spacing:.16em}
        .eyebrow-pulse{width:7px;height:7px;border-radius:50%;background:#9FE9C1;box-shadow:0 0 0 4px rgba(159,233,193,.09),0 0 12px rgba(159,233,193,.3)}
        .welcome-copy h1{margin:13px 0 10px;font-size:clamp(34px,8vw,48px);font-weight:680;line-height:1.02;letter-spacing:-.065em}
        .welcome-copy h1 em{font-style:normal;background:linear-gradient(100deg,#E6F9E9 5%,#B9E8F4 75%);background-clip:text;-webkit-background-clip:text;color:transparent}
        .welcome-copy p{margin:0;color:#9BAFA3;font-size:13px;line-height:1.6}
        .feature-carousel{position:relative;isolation:isolate;min-height:285px;overflow:hidden;border:1px solid rgba(205,239,216,.18);border-radius:25px;background:#234333;box-shadow:0 18px 50px rgba(0,0,0,.2);touch-action:pan-y}
        .carousel-photo,.carousel-glow{position:absolute;inset:0;z-index:-2;background-size:cover;background-repeat:no-repeat;transition:background-image .35s ease,background-position .35s ease}
        .carousel-glow{z-index:-1;background:radial-gradient(ellipse at 88% 14%,rgba(185,232,244,.19),transparent 35%),linear-gradient(120deg,rgba(20,65,44,.2),transparent 70%)}
        .tone-blue .carousel-glow{background:radial-gradient(ellipse at 88% 14%,rgba(130,208,255,.2),transparent 36%),linear-gradient(120deg,rgba(18,49,75,.2),transparent 70%)}
        .tone-violet .carousel-glow{background:radial-gradient(ellipse at 88% 14%,rgba(208,173,255,.18),transparent 36%),linear-gradient(120deg,rgba(54,35,70,.2),transparent 70%)}
        .carousel-topline{position:absolute;top:17px;left:18px;right:18px;display:flex;align-items:center;justify-content:space-between;color:rgba(244,252,246,.83);font-size:8px;font-weight:850;letter-spacing:.15em}
        .carousel-topline i{font-style:normal;color:rgba(244,252,246,.6)}
        .carousel-copy{position:absolute;left:20px;right:52px;bottom:45px;max-width:370px;animation:carousel-copy-in .35s ease both}
        .carousel-eyebrow{display:inline-flex;margin-bottom:10px;color:#D4F3E0;font-size:9px;letter-spacing:.15em;font-weight:850}
        .carousel-copy h2{max-width:330px;margin:0 0 9px;color:white;font-size:clamp(25px,6vw,36px);line-height:1.03;letter-spacing:-.055em;font-weight:720;text-shadow:0 2px 18px rgba(0,0,0,.18)}
        .carousel-copy p{max-width:290px;margin:0 0 17px;color:rgba(245,251,246,.84);font-size:12px;line-height:1.55}
        .carousel-cta{display:inline-flex;align-items:center;gap:9px;padding:10px 13px;border:1px solid rgba(255,255,255,.45);border-radius:12px;background:rgba(236,250,241,.94);color:#17382A;text-decoration:none;font-size:11px;font-weight:800;box-shadow:0 6px 20px rgba(0,0,0,.13);transition:transform .18s,background .18s}
        .carousel-cta:hover{transform:translateY(-1px);background:#fff}
        .carousel-arrow{position:absolute;top:50%;display:grid;place-items:center;width:32px;height:32px;transform:translateY(-50%);border:1px solid rgba(255,255,255,.28);border-radius:50%;background:rgba(13,27,19,.45);color:#fff;backdrop-filter:blur(8px)}
        .carousel-arrow span{font-family:system-ui,sans-serif;font-size:27px;line-height:1;margin-top:-3px}
        .carousel-arrow.previous{right:14px;top:45%}
        .carousel-arrow.next{right:14px;top:calc(45% + 42px)}
        .carousel-dots{position:absolute;bottom:18px;right:20px;display:flex;align-items:center;gap:6px}
        .carousel-dots button{width:6px;height:6px;padding:0;border:0;border-radius:20px;background:rgba(255,255,255,.56);transition:width .2s,background .2s}
        .carousel-dots button.selected{width:22px;background:var(--ice)}
        .workspace-section{margin-top:30px}
        .section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:15px}
        .section-kicker{color:#789185;font-size:8px;font-weight:850;letter-spacing:.16em}
        .section-heading h2{margin:5px 0 0;font-size:21px;letter-spacing:-.045em;font-weight:680}
        .section-heading>a{display:flex;align-items:center;gap:5px;padding-bottom:3px;color:var(--ice);font-size:10px;font-weight:750;text-decoration:none;white-space:nowrap}
        .workspace-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .workspace-card{position:relative;isolation:isolate;display:flex;align-items:flex-end;min-width:0;min-height:168px;overflow:hidden;padding:13px;border:1px solid rgba(224,244,228,.13);border-radius:20px;background:#20372A;color:#fff;text-decoration:none;box-shadow:0 9px 25px rgba(0,0,0,.12);animation:workspace-in .35s ease both;animation-delay:calc(var(--card-index)*45ms);transition:transform .2s,border-color .2s}
        .workspace-photo{position:absolute;inset:0;z-index:-2;background-position:center;background-size:cover;transition:transform .45s ease}
        .workspace-card:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(10,23,16,.03) 0%,rgba(10,23,16,.12) 28%,rgba(7,17,12,.9) 100%)}
        .workspace-card:hover{transform:translateY(-2px);border-color:rgba(185,232,244,.48)}
        .workspace-card:hover .workspace-photo{transform:scale(1.05)}
        .workspace-card.ocean{background:#1D3546}.workspace-card.amber{background:#4B3925}.workspace-card.plum{background:#3D304B}
        .workspace-icon{position:absolute;top:12px;left:12px;display:grid;place-items:center;width:35px;height:35px;border:1px solid rgba(255,255,255,.24);border-radius:12px;background:rgba(15,29,20,.48);color:#D5F3E2;backdrop-filter:blur(12px)}
        .workspace-card.ocean .workspace-icon{color:#B9E8F4}.workspace-card.amber .workspace-icon{color:#FFE0A5}.workspace-card.plum .workspace-icon{color:#E5CEFF}
        .workspace-card-copy{display:flex;flex-direction:column;gap:5px;min-width:0;padding-right:15px}
        .workspace-card-copy strong{font-size:15px;line-height:1.15;letter-spacing:-.025em;font-weight:750;text-shadow:0 1px 12px rgba(0,0,0,.22)}
        .workspace-card-copy small{color:rgba(245,250,246,.77);font-size:10px;line-height:1.4}
        .workspace-arrow{position:absolute;right:12px;bottom:15px;display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(12,25,17,.36);color:#F4FBF5}
        .ai-companion-card{position:relative;display:flex;align-items:center;gap:14px;overflow:hidden;margin-top:15px;padding:17px;border:1px solid rgba(185,232,244,.25);border-radius:20px;background:radial-gradient(ellipse at 0% 0%,rgba(185,232,244,.16),transparent 50%),linear-gradient(120deg,#1A3327,#1A2922 70%,#1A2A2D);color:#F4FBF5;text-decoration:none}
        .ai-orbit-art{position:relative;display:grid;place-items:center;flex:0 0 51px;width:51px;height:51px;border:1px solid rgba(185,232,244,.5);border-radius:17px;background:linear-gradient(145deg,#B9E8F4,#D5F3D9);box-shadow:0 7px 25px rgba(185,232,244,.12)}
        .ai-orbit-art:before,.ai-orbit-art:after{content:"";position:absolute;width:35px;height:15px;border:1.5px solid #255B4B;border-radius:50%;transform:rotate(-35deg)}
        .ai-orbit-art:after{transform:rotate(35deg)}
        .ai-orbit-art span{position:absolute;width:7px;height:7px;border-radius:50%;background:#173B30;z-index:2}
        .ai-orbit-art i,.ai-orbit-art b{position:absolute;z-index:2;width:4px;height:4px;border-radius:50%;background:#438B79;top:10px;right:9px}
        .ai-orbit-art b{top:auto;right:auto;left:8px;bottom:12px;background:#77BFD0}
        .ai-companion-copy{display:flex;flex:1;flex-direction:column;gap:5px;min-width:0}
        .ai-companion-copy>span{color:var(--ice);font-size:8px;font-weight:850;letter-spacing:.15em}
        .ai-companion-copy strong{font-size:14px;line-height:1.25;letter-spacing:-.02em}
        .ai-companion-copy small{color:#A9BDB0;font-size:10px;line-height:1.45}
        .ai-companion-arrow{display:grid;place-items:center;flex:0 0 31px;width:31px;height:31px;border-radius:50%;background:rgba(185,232,244,.1);color:var(--ice)}
        .progress-card{display:flex;align-items:center;gap:13px;margin-top:12px;padding:15px;border:1px solid #2E4235;border-radius:19px;background:linear-gradient(130deg,#17251C,#18211C)}
        .progress-art{position:relative;display:grid;place-items:center;flex:0 0 47px;width:47px;height:47px;border:1px solid #385844;border-radius:15px;background:linear-gradient(145deg,#294B36,#1F3528);color:#B9E8C9}
        .progress-art span,.progress-art i{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--ice);right:7px;top:8px}.progress-art i{right:auto;top:auto;left:8px;bottom:9px;width:3px;height:3px;background:#9BE9C1}
        .progress-copy{display:flex;flex:1;flex-direction:column;gap:5px;min-width:0}
        .progress-copy>span{color:#82998A;font-size:8px;font-weight:850;letter-spacing:.13em}
        .progress-copy strong{font-size:12px;font-weight:750}
        .progress-copy p{margin:0;color:#9BAFA3;font-size:10px;line-height:1.5}
        .progress-card>a{display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;border:1px solid #344B3C;border-radius:50%;color:var(--ice);text-decoration:none}
        @keyframes carousel-copy-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes workspace-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(min-width:620px){.home-content{padding:38px 25px 30px}.welcome-copy{margin-bottom:27px}.feature-carousel{min-height:330px;border-radius:28px}.carousel-copy{left:27px;bottom:51px}.carousel-topline{left:25px;right:25px;top:22px}.workspace-grid{gap:15px}.workspace-card{min-height:190px;padding:16px}.workspace-card-copy strong{font-size:17px}.workspace-card-copy small{font-size:11px}.workspace-section{margin-top:35px}.home-nav{bottom:17px}.home-nav a{flex-direction:row;gap:8px;font-size:11px}.home-nav a span{font-size:11px}}
        @media(max-width:380px){.home-content{padding:24px 13px 20px}.home-header{min-height:66px;padding-left:14px;padding-right:14px}.home-brand strong{font-size:15px}.home-brand small{font-size:7px}.welcome-copy h1{font-size:33px}.feature-carousel{min-height:270px;border-radius:21px}.carousel-copy{left:15px;right:43px;bottom:43px}.carousel-copy h2{font-size:25px}.carousel-copy p{font-size:11px}.carousel-topline{left:15px;right:15px}.carousel-arrow{width:28px;height:28px;right:9px}.carousel-arrow.previous{top:44%}.carousel-arrow.next{top:calc(44% + 36px)}.workspace-grid{gap:9px}.workspace-card{min-height:155px;padding:10px;border-radius:17px}.workspace-icon{left:9px;top:9px;width:31px;height:31px}.workspace-card-copy strong{font-size:13px}.workspace-card-copy small{font-size:9px}.workspace-arrow{right:8px;bottom:10px;width:24px;height:24px}.ai-companion-card{gap:10px;padding:13px}.ai-orbit-art{flex-basis:43px;width:43px;height:43px}.ai-companion-copy strong{font-size:12px}.ai-companion-copy small{font-size:9px}.progress-card{padding:12px;gap:10px}.progress-art{flex-basis:40px;width:40px;height:40px}.progress-copy p{font-size:9px}.home-nav{width:calc(100% - 18px);padding:5px;gap:2px}.home-nav a{gap:3px;font-size:8px}.home-nav a svg{width:19px;height:19px}}
        @media(prefers-reduced-motion:reduce){.carousel-copy,.workspace-card{animation:none}.carousel-photo,.workspace-photo,.carousel-cta,.workspace-card,.home-nav a{transition:none}}
      `}</style>
    </main>
  );
}
