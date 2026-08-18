"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthMode = "signin" | "signup";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const client = supabase;
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client) return;
    client.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [client]);

  if (!client) {
    return <div className="auth-screen"><div className="auth-card"><div className="brand-mark auth-mark">MB</div><h1>Mah Buddy</h1><p>Add the Supabase environment variables in Vercel to enable accounts.</p></div></div>;
  }

  const authClient = client;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = mode === "signin"
      ? await authClient.auth.signInWithPassword({ email, password })
      : await authClient.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else setMessage(mode === "signup" ? "Check your email to confirm your account." : "");
  }

  async function google() {
    setMessage("");
    const { error } = await authClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setMessage(error.message);
  }

  async function signOut() {
    await authClient.auth.signOut();
  }

  if (user) {
    return <>{children}<button className="account-float" onClick={signOut}>Sign out</button></>;
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand-mark auth-mark">MB</div>
        <h1>{mode === "signin" ? "Welcome back" : "Create your Mah Buddy account"}</h1>
        <p>{mode === "signin" ? "Sign in to keep your chats and study progress together." : "Create an account to sync your Mah Buddy experience."}</p>
        <button className="google-btn" onClick={google} type="button"><span>G</span> Continue with Google</button>
        <div className="auth-divider"><span>or</span></div>
        <form onSubmit={submit} className="auth-form">
          <input type="email" required autoComplete="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        <button className="switch-auth" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>
          {mode === "signin" ? "New to Mah Buddy? Create an account" : "Already have an account? Sign in"}
        </button>
        <small className="auth-footnote">Your account is protected by Supabase Auth.</small>
      </div>
    </div>
  );
}
