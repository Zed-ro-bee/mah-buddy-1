"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = { preferredName: string; buddyName: string; age: string };
const KEY = "mah-buddy-profile";
const defaults: Profile = { preferredName: "", buddyName: "Mah Buddy", age: "" };

function Logo({ size = 42 }) { return <img src="/mah-buddy-logo.svg" alt="Mah Buddy" width={size} height={size} style={{ objectFit: "contain" }} />; }
function FieldIcon({ children }: { children: React.ReactNode }) { return <span className="pf-icon">{children}</span>; }

export default function ProfilePage() {
  const [profile, setProfile] = useState(defaults);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setProfile({ ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }); } catch {}
    if (supabase) supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  function update(values: Partial<Profile>) {
    const next = { ...profile, ...values };
    setProfile(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  return <main className="profile-app">
    <header className="profile-header">
      <a className="profile-back" href="/">‹</a>
      <div className="profile-brand"><Logo size={31}/><strong>Mah Buddy</strong></div>
      {saved ? <span className="saved">✓ Saved</span> : <a className="profile-menu" href="/settings">⚙</a>}
    </header>

    <div className="profile-scroll">
      <section className="profile-hero">
        <div className="hero-logo"><Logo size={58}/></div>
        <span>YOUR SPACE</span>
        <h1>Make it personal.</h1>
        <p>Tell Mah Buddy what to call you — and what you want to call your buddy.</p>
      </section>

      <section className="profile-card">
        <div className="section-label">PERSONAL DETAILS</div>
        <label className="profile-field">
          <span className="field-title">What should Mah Buddy call you?</span>
          <span className="field-help">This name is used in greetings and your study space.</span>
          <div className="input-wrap"><FieldIcon>◯</FieldIcon><input value={profile.preferredName} onChange={e => update({ preferredName: e.target.value })} placeholder="e.g. Arinze" autoComplete="given-name" /></div>
        </label>
        <label className="profile-field">
          <span className="field-title">What do you want to call Mah Buddy?</span>
          <span className="field-help">Choose the name your buddy should use for itself.</span>
          <div className="input-wrap"><FieldIcon>♡</FieldIcon><input value={profile.buddyName} onChange={e => update({ buddyName: e.target.value })} placeholder="e.g. Mah Buddy" /></div>
        </label>
        <label className="profile-field">
          <span className="field-title">Your age</span>
          <span className="field-help">Used only to personalize your learning experience.</span>
          <div className="input-wrap"><FieldIcon>▣</FieldIcon><input inputMode="numeric" type="number" min="5" max="120" value={profile.age} onChange={e => update({ age: e.target.value })} placeholder="Age" /></div>
        </label>
      </section>

      <section className="profile-account"><span>ACCOUNT</span><strong>{email || "Signed-in account"}</strong><small>Your profile stays connected to this account.</small></section>
      <a className="profile-continue" href="/">Continue to Mah Buddy <span>→</span></a>
    </div>

    <nav className="profile-bottom"><a href="/"><span>⌂</span><small>Home</small></a><a href="/settings"><span>⚙</span><small>Settings</small></a><a className="active" href="/profile"><span>◯</span><small>Profile</small></a></nav>

    <style jsx>{`
      *{box-sizing:border-box}.profile-app{min-height:100svh;background:#f7f6f9;color:#20202a;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.profile-header{height:64px;display:flex;align-items:center;padding:0 max(16px,calc((100vw - 860px)/2));gap:10px;background:rgba(255,255,255,.94);border-bottom:1px solid #e7e4ec;position:sticky;top:0;z-index:5;backdrop-filter:blur(16px)}.profile-back,.profile-menu{width:39px;height:39px;border:1px solid #e5e1e9;border-radius:12px;background:#fff;display:grid;place-items:center;color:#222;text-decoration:none;font-size:22px}.profile-brand{display:flex;align-items:center;gap:8px;font-size:15px}.saved{margin-left:auto;color:#5c49d8;font-size:11px;font-weight:800}.profile-menu{margin-left:auto;font-size:17px}.profile-scroll{max-width:720px;margin:0 auto;padding:24px 18px 40px}.profile-hero{padding:28px;border-radius:28px;background:linear-gradient(135deg,#e6defd,#d5eff2 55%,#f6d5e6);border:1px solid #ded9e5;box-shadow:0 16px 45px rgba(50,40,90,.08)}.hero-logo{width:84px;height:84px;border-radius:26px;background:rgba(255,255,255,.74);display:grid;place-items:center;margin-bottom:22px}.profile-hero>span{font-size:10px;letter-spacing:.2em;color:#7058da;font-weight:900}.profile-hero h1{font:500 clamp(42px,8vw,64px)/.92 Georgia,serif;margin:8px 0 14px;color:#24202d}.profile-hero p{font:400 15px/1.55 Georgia,serif;color:#575260;max-width:560px;margin:0}.profile-card{margin-top:14px;padding:22px;border:1px solid #e3dfe7;border-radius:24px;background:#fff;box-shadow:0 12px 35px rgba(30,25,50,.05)}.section-label{font-size:9px;letter-spacing:.18em;color:#8b8792;font-weight:900;margin-bottom:18px}.profile-field{display:block;margin:0 0 19px}.profile-field:last-child{margin-bottom:0}.field-title{display:block;font-size:14px;font-weight:800;color:#272630}.field-help{display:block;color:#85818d;font-size:11px;line-height:1.45;margin:4px 0 8px}.input-wrap{display:flex;align-items:center;gap:9px;border:1px solid #dcd8e1;border-radius:14px;background:#fbfafc;padding:5px 11px;transition:.15s}.input-wrap:focus-within{border-color:#7257eb;box-shadow:0 0 0 3px #7257eb14;background:#fff}.pf-icon{width:30px;height:30px;border-radius:9px;background:#eeeafd;color:#6548dc;display:grid;place-items:center;font-size:13px;flex:0 0 auto}.input-wrap input{width:100%;border:0;outline:0;background:transparent;color:#24232c;padding:10px 2px;font:14px inherit}.profile-account{margin-top:12px;border:1px solid #e3dfe7;border-radius:18px;background:#fff;padding:15px 17px}.profile-account span{display:block;font-size:8px;letter-spacing:.18em;color:#9995a0;font-weight:900}.profile-account strong{display:block;font-size:13px;margin-top:4px}.profile-account small{display:block;color:#9a96a1;font-size:10px;margin-top:4px}.profile-continue{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:12px;border-radius:15px;padding:14px 18px;background:linear-gradient(135deg,#5f45e6,#b239db);color:#fff;text-decoration:none;font-size:13px;font-weight:900;box-shadow:0 12px 25px #694ee52b}.profile-continue span{font-size:19px}.profile-bottom{display:none}
      @media(max-width:767px){.profile-header{height:58px;padding:0 12px}.profile-scroll{padding:12px 12px 76px}.profile-hero{padding:22px;border-radius:23px}.hero-logo{width:66px;height:66px;border-radius:21px;margin-bottom:18px}.profile-hero h1{font-size:45px}.profile-hero p{font-size:14px}.profile-card{padding:18px;border-radius:20px}.profile-field{margin-bottom:17px}.profile-bottom{position:fixed;display:flex;left:0;right:0;bottom:0;height:56px;background:rgba(255,255,255,.97);border-top:1px solid #e5e1e9;z-index:10;justify-content:space-around}.profile-bottom a{flex:1;text-decoration:none;color:#77727f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.profile-bottom span{font-size:18px}.profile-bottom small{font-size:9px}.profile-bottom .active{color:#6548df}.profile-menu{margin-left:auto}}
    `}</style>
  </main>;
}
