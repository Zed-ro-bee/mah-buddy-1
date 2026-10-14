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
    try {
      if (supabase) await supabase.auth.signOut({ scope: "global" });
      Object.keys(localStorage).filter(key => key.startsWith("sb-") && key.includes("auth-token")).forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();
      window.location.replace("/?auth=signin");
    } catch {
      window.location.replace("/?auth=signin");
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
        <div className="head-brand"><Logo size={30}/><div><strong>Profile</strong><span>Mah Buddy</span></div></div>
        <span className="saved" role="status">{saved ? "Saved ✓" : ""}</span>
      </header>

      <div className="profile-content">
        <section className="identity-card">
          <div className="identity-top"><span className="eyebrow">YOUR SPACE</span><span className="status-pill"><i/> Personal learning profile</span></div>
          <div className="avatar-area">
            <div className="avatar"><span>{(profile.preferredName || "M").trim().slice(0, 1).toUpperCase()}</span><i><Logo size={12}/></i></div>
            <div><b>{profile.preferredName || "Your profile"}</b><small>{profile.preferredName ? "Your personal study space" : "Add your name to personalise Mah Buddy"}</small></div>
          </div>
          <h1>Make it <em>personal.</em></h1>
          <p>Set your learning preferences so Mah Buddy can adapt explanations, examples and study suggestions to you. You can leave any optional field blank.</p>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>PERSONAL DETAILS</span><h2>About you</h2></div><b>01</b></div>
          <Field label="What should Mah Buddy call you?" sub="Used to personalise greetings and your study space."><input value={profile.preferredName} onChange={e => persist({ preferredName: e.target.value })} placeholder="Your preferred name" autoComplete="nickname"/></Field>
          <Field label="What do you want to call Mah Buddy?" sub="Choose a name for your study companion."><input value={profile.buddyName} onChange={e => persist({ buddyName: e.target.value })} placeholder="Mah Buddy"/></Field>
          <Field label="Your age (optional)" sub="Helps keep explanations appropriate to your learning needs."><input inputMode="numeric" type="number" min="5" max="120" value={profile.age} onChange={e => persist({ age: e.target.value })} placeholder="Leave blank if you prefer"/></Field>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>LEARNING PROFILE</span><h2>Your direction</h2></div><b>02</b></div>
          <Field label="Education level" sub="Choose the stage that best describes your current studies."><select value={profile.educationLevel} onChange={e => persist({ educationLevel: e.target.value })}><option value="">Choose education level</option><option>Primary school</option><option>Secondary school</option><option>College / university</option><option>Postgraduate study</option><option>Professional learning</option><option>Independent learning</option></select></Field>
          <Field label="Explanation style" sub="You can change this whenever you need."><select value={profile.explanationStyle} onChange={e => persist({ explanationStyle: e.target.value })}><option>Easy</option><option>Normal</option><option>Advanced</option></select></Field>
          <Field label="Learning level" sub="Sets the language and depth used in explanations."><select value={profile.learningLevel} onChange={e => persist({ learningLevel: e.target.value })}><option value="">Choose your level</option>{levels.map(l => <option key={l.value} value={l.value}>{l.value} — {l.detail}</option>)}</select></Field>
          <Field label="Subjects you are interested in" sub="Add subjects separated by commas."><input value={profile.subjects} onChange={e => persist({ subjects: e.target.value })} placeholder="e.g. Biology, maths, history"/></Field>
          <Field label="Your current goal" sub="Helps tailor study suggestions."><select value={profile.goal} onChange={e => persist({ goal: e.target.value })}><option value="">Choose a goal</option><option>Exam preparation</option><option>Homework and assignments</option><option>Understanding difficult topics</option><option>Building study habits</option><option>Learning a new skill</option><option>General learning</option></select></Field>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>WORLDWIDE LEARNING</span><h2>Your education system</h2></div><b>03</b></div>
          <p className="profile-helper">Optional settings for students anywhere in the world. Leave them blank if they do not apply.</p>
          <Field label="Country or region" sub="Used only to make examples and study guidance more relevant."><input value={profile.country} onChange={e => persist({ country: e.target.value })} placeholder="Country or region" autoComplete="country-name"/></Field>
          <Field label="Curriculum or qualification" sub="Enter the name used in your education system, if relevant."><input value={profile.curriculum} onChange={e => persist({ curriculum: e.target.value })} placeholder="e.g. national curriculum, IB, GCSE, AP"/></Field>
        </section>

        <section className="profile-panel profile-overview">
          <div className="panel-title"><div><span>YOUR JOURNEY</span><h2>Learning overview</h2></div><b>04</b></div>
          <div className="profile-stats three-stats">
            <div><strong>{topicCount}</strong><span>Topics practised</span></div>
            <div><strong>{quizCount}</strong><span>Quizzes completed</span></div>
            <div><strong>{flashcardCount}</strong><span>Flashcard sets</span></div>
          </div>
          <div className="accuracy-line"><span>Quiz accuracy</span><strong>{accuracy}%</strong></div>
          <div className="accuracy-track"><span style={{ width: accuracy + "%" }}/></div>
          <a className="profile-inline-link" href="/study/progress">View full progress <span>→</span></a>
          <p className="profile-helper">These figures come from saved activity on this device. They may not include activity on another device.</p>
        </section>

        <section className="profile-panel">
          <div className="panel-title"><div><span>YOUR PREFERENCES</span><h2>Stay in control</h2></div><b>05</b></div>
          <div className="preference-toggle">
            <span><b>Study reminders</b><small>Save your preference for study reminder features when available.</small></span>
            <input type="checkbox" checked={profile.notifications} onChange={e => persist({ notifications: e.target.checked })} aria-label="Enable study reminders"/>
          </div>
          <div className="profile-inline-link reset-link"><span>Reset learning preferences</span><button type="button" onClick={resetLearningProfile}>Reset <span>↻</span></button></div>
        </section>

        <section className="account-card">
          <span>CONNECTED ACCOUNT</span>
          <div className="account-line"><div className="account-symbol"><Logo size={24}/></div><div><strong>{email || "Account not connected"}</strong><small>{email ? "Your sign-in email is managed by your account provider." : "Sign in to connect your account. Profile preferences remain on this device."}</small></div><b>{email ? "✓" : "○"}</b></div>
        </section>

        <section className="account-actions">
          <ActionRow icon="⌘" title="Privacy & data" description="Export or clear learning data saved on this device" href="/settings/privacy"/>
          <ActionRow icon="◈" title="Privacy policy" description="How Mah Buddy handles information" href="/privacy-policy"/>
          <ActionRow icon="§" title="Terms of service" description="Read the terms for using Mah Buddy" href="/terms-of-service"/>
          <ActionRow icon="?" title="Help & learning support" description="Ask Mah Buddy for help" href="/?prompt=Help%20me%20use%20Mah%20Buddy%20and%20its%20study%20features."/>
          <button type="button" onClick={signOut} disabled={signingOut}><span className="action-symbol">↗</span><span><b>{signingOut ? "Signing out…" : "Sign out"}</b><small>Sign out of your Mah Buddy account</small></span><strong>→</strong></button>
        </section>

        <a href="/" className="continue">Continue to Mah Buddy <span>→</span></a>
        <p className="profile-footnote">Your learning preferences are saved locally on this device. Use Privacy & data to review or clear locally saved information.</p>
      </div>
      <style jsx>{`
        .profile-helper{font-size:11px;line-height:1.6;color:#A0ACA3;margin:0 0 8px}
        .three-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
        .profile-stats>div{min-width:0;padding:12px 9px}
        .profile-stats strong{font-size:clamp(19px,5vw,25px)}
        .profile-stats span{line-height:1.4}
        .accuracy-line{display:flex;justify-content:space-between;align-items:center;margin-top:17px;font-size:11px;color:#A0ACA3}
        .accuracy-line strong{color:#9BE8F4;font-size:13px}
        .accuracy-track{height:5px;margin-top:8px;border-radius:99px;overflow:hidden;background:#304238}
        .accuracy-track span{display:block;height:100%;border-radius:99px;background:#9BE8F4;transition:width .2s ease}
        .preference-toggle{display:flex;align-items:center;gap:16px;justify-content:space-between;padding:8px 0 15px}
        .preference-toggle>span{display:flex;flex-direction:column;gap:5px}
        .preference-toggle b{font-size:12px}
        .preference-toggle small{font-size:10px;line-height:1.5;color:#849188}
        .preference-toggle input{width:42px;height:23px;accent-color:#9BE8F4;flex-shrink:0}
        .reset-link{margin-top:0}
        .reset-link button{border:1px solid #344B3C;background:#141916;border-radius:9px;color:#9BE8F4;padding:8px 10px;font-size:10px;font-weight:700}
        .profile-footnote{margin:0 0 8px;text-align:center;font-size:10px;line-height:1.6;color:#849188}
        .account-actions .danger-action{color:#F0B5B5}
        @media(max-width:380px){.three-stats{gap:6px}.profile-stats>div{padding:10px 7px}.profile-stats span{font-size:9px}}
      `}</style>
    </main>
  );
}
