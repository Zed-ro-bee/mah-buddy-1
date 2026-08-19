"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthMode = "signin" | "signup";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const client = supabase;
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    const authClient = client;
    authClient.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = authClient.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, [client]);

  if (!client) return <div className="auth-screen"><div className="auth-card"><div className="brand-mark auth-mark">MB</div><h1>Mah Buddy</h1><p>Add the Supabase environment variables in Vercel to enable accounts.</p></div></div>;
  const authClient = client;

  if (user) return <>{children}<button className="account-float" onClick={() => authClient.auth.signOut()}>Sign out</button></>;

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const result = mode === "signin"
      ? await authClient.auth.signInWithPassword({ email, password })
      : await authClient.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup") setMessage("Check your email to confirm your account.");
  }

  async function google() {
    setMessage("");
    const { error } = await authClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setMessage(error.message);
  }

  if (!started) return (
    <div className="intro-screen">
      <div className="intro-orb" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <div className="intro-brand">Mah Buddy</div>
      <p className="intro-tagline">Your AI study companion</p>
      <button className="get-started" onClick={() => setStarted(true)}>Get Started</button>
    </div>
  );

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand-mark auth-mark">MB</div>
        <div className="auth-choice-title">Welcome to Mah Buddy</div>
        <div className="auth-choice-buttons">
          <button className={`auth-choice ${mode === "signin" ? "primary" : ""}`} onClick={() => setMode("signin")}>Sign in</button>
          <button className={`auth-choice ${mode === "signup" ? "primary" : ""}`} onClick={() => setMode("signup")}>Sign up</button>
        </div>
        <h1>{mode === "signin" ? "Welcome back" : "Welcome"}</h1>
        <p>{mode === "signin" ? "Sign in to continue to Mah Buddy." : "Create your account to get started with Mah Buddy."}</p>
        <button className="google-btn" onClick={google} type="button"><span>G</span> Continue with Google</button>
        <div className="auth-divider"><span>or</span></div>
        <form onSubmit={submit} className="auth-form">
          <input type="email" required autoComplete="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}</button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        <button className="switch-auth" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>
          {mode === "signin" ? "New to Mah Buddy? Sign up" : "Already have an account? Sign in"}
        </button>
        <small className="auth-footnote">Your account is protected by Supabase Auth.</small>
      </div>
    </div>
  );
}
