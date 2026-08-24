"use client";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PersistenceBridge from "./persistence-bridge";

type AuthMode = "signin" | "signup";
type AuthClient = NonNullable<typeof supabase>;

function Mark({ large = false }: { large?: boolean }) {
  return <img className={large ? "auth-logo large" : "auth-logo"} src="/mah-buddy-logo.svg" alt="Mah Buddy" />;
}

function GoogleMark() {
  return <svg className="google-svg" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M47.5 24.5c0-1.7-.2-3.4-.5-5H24v9.5h13.2c-.6 3.1-2.4 5.7-5.1 7.5v6.2h8.2c4.8-4.4 7.2-10.8 7.2-18.2Z"/><path fill="#34A853" d="M24 48c6.9 0 12.7-2.3 16.9-6.2l-8.2-6.2c-2.3 1.5-5.2 2.4-8.7 2.4-6.7 0-12.4-4.5-14.4-10.6H1.1v6.4C5.3 42.2 13.9 48 24 48Z"/><path fill="#FBBC05" d="M9.6 27.4c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7v-6.4H1.1C-.4 14.6-1.2 19.2-1.2 24s.8 9.4 2.3 13.4l8.5-6.4Z"/><path fill="#EA4335" d="M24 9.6c3.8 0 7.1 1.3 9.7 3.8l7.3-7.3C36.7 2.3 30.9 0 24 0 13.9 0 5.3 5.8 1.1 13.6l8.5 6.4C11.6 14.1 17.3 9.6 24 9.6Z"/></svg>;
}

function Intro({ onStart }: { onStart: () => void }) {
  return <main className="auth-intro mb-onboarding"><div className="intro-top"><span>MAH BUDDY</span><span>YOUR AI STUDY COMPANION</span></div><section className="intro-hero"><div className="intro-orbit"><span className="orbit-dot one"/><span className="orbit-dot two"/><div className="intro-logo-wrap"><Mark large/></div></div><div className="intro-copy"><p className="intro-kicker">LEARN · PRACTISE · GROW</p><h1>Meet your<br/><em>Mah Buddy.</em></h1><p>Your calm AI study companion for conversations, explanations, flashcards, quizzes and voice learning.</p><button type="button" className="intro-start" onClick={onStart}>Get Started <span>→</span></button></div></section><div className="intro-bottom"><span>01</span><i/><span>READY WHEN YOU ARE</span></div></main>;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStarted(window.sessionStorage.getItem("mah-buddy-onboarding-seen") === "1");
    }
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    const auth: AuthClient = supabase;
    auth.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = auth.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setStarted(true);
        setMessage("Choose a new password for your Mah Buddy account.");
      }
      if (session?.user) setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) return <main className="auth-fallback"><Mark/><h1>Mah Buddy</h1><p>Add the Supabase environment variables in Vercel to enable accounts.</p></main>;
  if (authLoading) return <main className="auth-fallback"><Mark/><h1>Mah Buddy</h1><p>Loading your account…</p></main>;

  const auth: AuthClient = supabase;
  if (user && !recovery) return <><PersistenceBridge userId={user.id}/>{children}</>;

  function start() {
    if (typeof window !== "undefined") window.sessionStorage.setItem("mah-buddy-onboarding-seen", "1");
    setStarted(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setResetSent(false);
    if (mode === "signin") {
      const r = await auth.auth.signInWithPassword({ email: email.trim(), password });
      if (r.error) setMessage(r.error.message);
    } else {
      const r = await auth.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
      if (r.error) setMessage(r.error.message);
      else if (r.data.session) setMessage("Account created. Welcome to Mah Buddy!");
      else setMessage("Account created. Check your email if confirmation is required.");
    }
    setBusy(false);
  }

  async function google() {
    setBusy(true);
    setMessage("");
    const { error } = await auth.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) {
      setBusy(false);
      setMessage(error.message);
    }
  }

  async function reset() {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await auth.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setBusy(false);
    if (error) setMessage(error.message);
    else setResetSent(true);
  }

  async function updatePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Your new password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await auth.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else {
      setRecovery(false);
      setNewPassword("");
      setMessage("Password updated. You are signed in.");
    }
    setBusy(false);
  }

  if (!started && !recovery) return <Intro onStart={start}/>;

  if (recovery) return <main className="auth-screen mb-auth"><section className="auth-form-card"><Mark/><div className="auth-form-heading"><span>ACCOUNT SECURITY</span><h2>Set a new password</h2><p>Choose a new password for your Mah Buddy account.</p></div><form onSubmit={updatePassword}><label>New password<input type="password" required minLength={6} placeholder="At least 6 characters" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><button className="auth-submit" disabled={busy}>{busy?"Updating…":"Update password"}</button></form>{message&&<p className="auth-msg">{message}</p>}</section></main>;

  return <main className="auth-screen mb-auth"><section className="auth-side"><div className="auth-side-brand"><Mark/><span>Mah Buddy</span></div><p className="auth-eyebrow">YOUR AI STUDY COMPANION</p><h1>Learn with a<br/><em>buddy.</em></h1><div className="auth-rule"/><p className="auth-copy">Ask questions, practise with quizzes and flashcards, or switch to voice mode when you want to talk it through.</p><div className="auth-preview"><div>CHAT</div><div>QUIZ</div><div>VOICE</div></div></section><section className="auth-form-card"><Mark/><div className="auth-form-heading"><span>WELCOME BACK</span><h2>{mode==="signin"?"Sign in":"Create your account"}</h2><p>{mode==="signin"?"Pick up where you left off.":"Start building your personal study space."}</p></div><div className="auth-tabs"><button type="button" className={mode==="signin"?"active":""} onClick={()=>{setMode("signin");setMessage("")}}>Sign in</button><button type="button" className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setMessage("")}}>Sign up</button></div><button type="button" className="google-btn" onClick={google} disabled={busy}><GoogleMark/><span>{busy?"Connecting…":"Continue with Google"}</span></button><div className="auth-or"><span/>or continue with email<span/></div><form onSubmit={submit}><label>Email address<input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required minLength={6} autoComplete={mode==="signin"?"current-password":"new-password"} placeholder="At least 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/></label><button type="submit" className="auth-submit" disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in":"Create account"}</button></form>{mode==="signin"&&!resetSent&&<button type="button" className="auth-link" disabled={busy} onClick={reset}>Forgot password?</button>}{resetSent&&<p className="auth-msg">Password reset email sent. Check your inbox.</p>}{message&&!resetSent&&<p className="auth-msg">{message}</p>}<button type="button" className="auth-switch" onClick={()=>{setMode(mode==="signin"?"signup":"signin");setMessage("");setResetSent(false)}}>{mode==="signin"?"New to Mah Buddy? Sign up":"Already have an account? Sign in"}</button></section></main>;
}
