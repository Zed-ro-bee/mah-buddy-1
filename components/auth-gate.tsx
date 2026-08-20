"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PersistenceBridge from "./persistence-bridge";

type AuthMode = "signin" | "signup";
type AuthClient = NonNullable<typeof supabase>;

type IntroProps = { onStart: () => void };

function BuddyLogo({ large = false }: { large?: boolean }) {
  return (
    <div className={large ? "intro-logo" : "brand-mark auth-mark"} aria-label="Mah Buddy logo">
      <span className="buddy-eye left" />
      <span className="buddy-eye right" />
      <span className="buddy-smile" />
    </div>
  );
}

function Intro({ onStart }: IntroProps) {
  return (
    <main className="intro-screen">
      <div className="intro-glow intro-glow-one" />
      <div className="intro-glow intro-glow-two" />
      <section className="intro-content" aria-labelledby="mah-buddy-intro-title">
        <BuddyLogo large />
        <div className="intro-brand">Mah Buddy</div>
        <p className="intro-tagline">Your friendly AI study companion</p>
        <h1 id="mah-buddy-intro-title">Learn. Ask. Think. Together.</h1>
        <p className="intro-copy">
          Mah Buddy helps you understand difficult topics, practice what you learn,
          organize conversations, and chat naturally whenever you need a buddy.
        </p>
        <div className="intro-features" aria-label="Mah Buddy features">
          <span>✦ Explain anything</span>
          <span>▤ Flashcards</span>
          <span>✓ Quiz me</span>
          <span>◉ Voice conversations</span>
        </div>
        <button className="get-started" onClick={onStart}>Get Started</button>
        <p className="intro-note">Free to get started · Your conversations are private to your account</p>
      </section>
    </main>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const auth: AuthClient = supabase;
    auth.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = auth.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <BuddyLogo />
          <h1>Mah Buddy</h1>
          <p>Add the Supabase environment variables in Vercel to enable accounts.</p>
        </div>
      </div>
    );
  }

  const auth: AuthClient = supabase;

  if (user) return <><PersistenceBridge userId={user.id} />{children}</>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResetSent(false);

    const result = mode === "signin"
      ? await auth.auth.signInWithPassword({ email, password })
      : await auth.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is required, then return to Mah Buddy.");
    }
  }

  async function google() {
    setMessage("");
    const { error } = await auth.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMessage(error.message);
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await auth.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setResetSent(true);
  }

  if (!started) return <Intro onStart={() => setStarted(true)} />;

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <BuddyLogo />
        <div className="auth-choice-title">Welcome to Mah Buddy</div>
        <div className="auth-choice-buttons" role="tablist" aria-label="Account access">
          <button className={`auth-choice ${mode === "signin" ? "primary" : ""}`} onClick={() => { setMode("signin"); setMessage(""); setResetSent(false); }} type="button">Sign in</button>
          <button className={`auth-choice ${mode === "signup" ? "primary" : ""}`} onClick={() => { setMode("signup"); setMessage(""); setResetSent(false); }} type="button">Sign up</button>
        </div>

        <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p>{mode === "signin" ? "Sign in and pick up where you left off." : "Create your Mah Buddy account and start learning."}</p>

        <button className="google-btn" onClick={google} type="button">
          <span aria-hidden="true">G</span> Continue with Google
        </button>
        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={submit} className="auth-form">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="auth-submit" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "signin" && !resetSent && (
          <button className="forgot-password" onClick={resetPassword} disabled={busy} type="button">
            Forgot password?
          </button>
        )}
        {resetSent && <div className="auth-message success">Password reset email sent. Check your inbox.</div>}
        {message && !resetSent && <div className="auth-message">{message}</div>}

        <button className="switch-auth" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); setResetSent(false); }} type="button">
          {mode === "signin" ? "New to Mah Buddy? Sign up" : "Already have an account? Sign in"}
        </button>
        <small className="auth-footnote">Protected by Supabase Auth.</small>
      </div>
    </main>
  );
}
