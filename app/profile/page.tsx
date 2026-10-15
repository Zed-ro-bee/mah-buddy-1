"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = {
  preferredName: string;
  buddyName: string;
  age: string;
  learningLevel: string;
  goal: string;
  educationLevel: string;
  country: string;
  curriculum: string;
  subjects: string;
  explanationStyle: string;
  notifications: boolean;
};

const KEY = "mah-buddy-profile";
const defaults: Profile = {
  preferredName: "", buddyName: "Mah Buddy", age: "", learningLevel: "",
  goal: "", educationLevel: "", country: "", curriculum: "", subjects: "",
  explanationStyle: "Normal", notifications: false,
};
const levels = [
  { value: "Foundation", detail: "Simple language and guided explanations" },
  { value: "Developing", detail: "Clear language with useful detail" },
  { value: "Proficient", detail: "Natural language with deeper explanations" },
  { value: "Advanced", detail: "Precise language and detailed reasoning" },
  { value: "Expert", detail: "Advanced language and full depth" },
];

function Logo({ size = 32 }: { size?: number }) {
  return <img src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy" />;
}
function Field({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return <label className="profile-field"><span><b>{label}</b><small>{sub}</small></span>{children}</label>;
}
function ActionRow({ icon, title, description, href, onClick, danger = false }: {
  icon: string; title: string; description: string; href?: string; onClick?: () => void; danger?: boolean;
}) {
  const content = <><span className="action-symbol">{icon}</span><span><b>{title}</b><small>{description}</small></span><strong>→</strong></>;
  return href
    ? <a href={href} className={danger ? "danger-action" : ""}>{content}</a>
    : <button type="button" onClick={onClick} className={danger ? "danger-action" : ""}>{content}</button>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaults);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [topicCount, setTopicCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);

  useEffect(() => {
    try {
      setProfile({ ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") });
      const results = JSON.parse(localStorage.getItem("mah-buddy-progress") || "[]");
      if (Array.isArray(results)) {
        setQuizCount(results.length);
        const total = results.reduce((n: number, r: { total?: number }) => n + (Number(r.total) || 0), 0);
        const correct = results.reduce((n: number, r: { score?: number }) => n + (Number(r.score) || 0), 0);
        setAccuracy(total ? Math.round(correct / total * 100) : 0);
        setTopicCount(new Set(results.map((r: { topic?: string }) => String(r.topic || "").trim()).filter(Boolean)).size);
      }
      const cards = JSON.parse(localStorage.getItem("mah-buddy-flashcard-history") || "[]");
      if (Array.isArray(cards)) setFlashcardCount(cards.length);
    } catch {}
    if (supabase) supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  function persist(patch: Partial<Profile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent("mah-buddy-profile-changed"));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    // Always finish on the public sign-in screen, even if Supabase returns
    // an auth error. Clear every browser-side Supabase session token as a
    // fallback, then force a full document navigation to reset React auth state.
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) console.error("Mah Buddy sign out:", error.message);
      }
    } catch (error) {
      console.error("Mah Buddy sign out:", error);
    } finally {
      try {
        const authKeys = Object.keys(localStorage).filter(
          key => /^sb-.*-auth-token$/i.test(key) || (/^sb-/i.test(key) && /auth-token/i.test(key))
        );
        for (const key of authKeys) localStorage.removeItem(key);

        // Clear legacy app flags only; keep account-scoped learning snapshots.
        sessionStorage.removeItem("mah-buddy-hydrated");
        sessionStorage.removeItem("mah-buddy-onboarding-seen");
        window.dispatchEvent(new CustomEvent("mah-buddy-account-cleared"));
      } catch (error) {
        console.error("Mah Buddy browser session cleanup:", error);
      }

      // /login currently redirects straight back to /. Use the root auth screen.
      window.location.href = "/?signedOut=1";
    }
  }

  function resetLearningProfile() {
    if (!window.confirm("Reset your learning preferences on this device? Your saved notes and quiz history will not be deleted.")) return;
    const next = { ...defaults, preferredName: profile.preferredName, buddyName: profile.buddyName };
    setProfile(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent("mah-buddy-profile-changed"));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  return (
    <main className="profile-app">
      <header className="profile-header">
        <a href="/study" className="back" aria-label="Back to Home">←</a>
        <div className="head-brand"><Logo size={30}/><div><strong>Your Profile</strong><span>Mah Buddy · Student account</span></div></div>
        <span className="saved" role="status">{saved ? "Saved ✓" : ""}</span>
      </header>
      <div className="profile-content">
        <section className="identity-card">
          <div className="identity-top"><span className="eyebrow">YOUR PROFILE</span><span className="status-pill"><i/> Student account</span></div>
          <div className="avatar-area"><div className="avatar"><span>{(profile.preferredName || "M").trim().slice(0,1).toUpperCase()}</span><i><Logo size={12}/></i></div><div><b>{profile.preferredName || "Your Name"}</b><small>{email || "Your personal learning space"}</small><small className="profile-learning-label">Learning profile · Personalised to you</small></div></div>
          <h1>Your profile, <em>your way.</em></h1>
          <p>Manage your details, study preferences, learning progress, and account settings in one place.</p>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>PROFILE</span><h2>About you</h2></div><b>01</b></div>
          <Field label="Preferred name" sub="How Mah Buddy should address you."><input value={profile.preferredName} onChange={e => persist({preferredName:e.target.value})} placeholder="Your name" autoComplete="nickname"/></Field>
          <Field label="Name for your buddy" sub="Give your study companion a name."><input value={profile.buddyName} onChange={e => persist({buddyName:e.target.value})} placeholder="Mah Buddy"/></Field>
          <Field label="Age (optional)" sub="Helps tailor explanations appropriately."><input type="number" inputMode="numeric" min="5" max="120" value={profile.age} onChange={e => persist({age:e.target.value})} placeholder="Leave blank if you prefer"/></Field>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>LEARNING</span><h2>Your study preferences</h2></div><b>02</b></div>
          <Field label="Current studies" sub="Choose what best describes you."><select value={profile.educationLevel} onChange={e => persist({educationLevel:e.target.value})}><option value="">Select education level</option><option>Primary school</option><option>Secondary school</option><option>College / university</option><option>Postgraduate study</option><option>Professional learning</option><option>Independent learning</option></select></Field>
          <Field label="Explanation style" sub="Change the level of detail whenever you need."><select value={profile.explanationStyle} onChange={e => persist({explanationStyle:e.target.value})}><option>Easy</option><option>Normal</option><option>Advanced</option></select></Field>
          <Field label="Learning level" sub="Adjust language and explanation depth."><select value={profile.learningLevel} onChange={e => persist({learningLevel:e.target.value})}><option value="">Select your level</option>{levels.map(l=><option key={l.value} value={l.value}>{l.value} — {l.detail}</option>)}</select></Field>
          <Field label="Subjects" sub="Separate subjects with commas."><input value={profile.subjects} onChange={e => persist({subjects:e.target.value})} placeholder="Biology, maths, history"/></Field>
          <Field label="Current goal" sub="What would you most like help with?"><select value={profile.goal} onChange={e => persist({goal:e.target.value})}><option value="">Select a goal</option><option>Exam preparation</option><option>Homework and assignments</option><option>Understanding difficult topics</option><option>Building study habits</option><option>Learning a new skill</option><option>General learning</option></select></Field>
          <Field label="Country or region (optional)" sub="For more relevant examples and study guidance."><input value={profile.country} onChange={e => persist({country:e.target.value})} placeholder="Country or region" autoComplete="country-name"/></Field>
          <Field label="Curriculum (optional)" sub="Only if it applies to your studies."><input value={profile.curriculum} onChange={e => persist({curriculum:e.target.value})} placeholder="e.g. IB, GCSE, AP, national curriculum"/></Field>
        </section>

        <section className="profile-panel profile-overview">
          <div className="panel-title"><div><span>YOUR PROGRESS</span><h2>Learning overview</h2></div><b>03</b></div>
          <div className="profile-stats three-stats"><div><strong>{topicCount}</strong><span>Topics practised</span></div><div><strong>{quizCount}</strong><span>Quizzes completed</span></div><div><strong>{flashcardCount}</strong><span>Flashcard sets</span></div></div>
          <div className="accuracy-line"><span>Quiz accuracy</span><strong>{accuracy}%</strong></div><div className="accuracy-track"><span style={{width:accuracy+"%"}}/></div>
          <a className="profile-inline-link" href="/study/progress">View full progress <span>→</span></a>
          <p className="profile-helper">Based on saved activity on this device. Activity from other devices may not be included.</p>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>SETTINGS</span><h2>Preferences</h2></div><b>04</b></div>
          <div className="preference-toggle"><span><b>Study reminders</b><small>Save your preference for reminder features when available.</small></span><input type="checkbox" checked={profile.notifications} onChange={e=>persist({notifications:e.target.checked})} aria-label="Enable study reminders"/></div>
          <div className="profile-inline-link reset-link"><span>Reset learning preferences</span><button type="button" onClick={resetLearningProfile}>Reset ↻</button></div>
        </section>

        <section className="account-card">
          <span>ACCOUNT</span><div className="account-line"><div className="account-symbol"><Logo size={24}/></div><div><strong>{email || "Account not connected"}</strong><small>{email ? "Signed-in email managed by your account provider." : "Your profile preferences are saved on this device."}</small></div><b>{email ? "✓" : "○"}</b></div>
        </section>

        <section className="account-actions">
          <ActionRow icon="⌘" title="Privacy & data" description="Export or clear learning data saved on this device" href="/settings/privacy"/>
          <ActionRow icon="◈" title="Privacy policy" description="How Mah Buddy handles information" href="/privacy-policy"/>
          <ActionRow icon="§" title="Terms of service" description="Read the terms for using Mah Buddy" href="/terms-of-service"/>
          <ActionRow icon="?" title="Help & support" description="Get help using Mah Buddy" href="/?prompt=Help%20me%20use%20Mah%20Buddy%20and%20its%20study%20features."/>
          <button type="button" onClick={signOut} disabled={signingOut}><span className="action-symbol">↗</span><span><b>{signingOut ? "Signing out…" : "Sign out"}</b><small>Sign out of your Mah Buddy account</small></span><strong>→</strong></button>
        </section>
        <a href="/" className="continue">Continue to Mah Buddy <span>→</span></a>
        <p className="profile-footnote">Manage the information saved on this device through Privacy & data.</p>
      </div>
        <nav className="profile-bottom-nav mb-nav-four" aria-label="Main navigation">
          <a href="/study"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7"/></svg><span>Home</span></a>
          <a href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 13.8 9.2 20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg><span>AI Assistance</span></a>
          <a href="/library"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/></svg><span>Resources</span></a>
          <a className="active" href="/profile" aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>Profile</span></a>
        </nav>
    </main>
  );
}
