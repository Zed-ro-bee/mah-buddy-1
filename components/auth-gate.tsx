"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PersistenceBridge from "./persistence-bridge";

type AuthClient = NonNullable<typeof supabase>;

const AUTH_CSS = `
.auth-lock{position:fixed;inset:0;z-index:2147483000;width:100vw;height:100svh;overflow:auto;background:#f7f8fc;color:#171827;font-family:'DM Sans',system-ui,sans-serif}
.auth-lock *{box-sizing:border-box}
.auth-lock button,.auth-lock input{font:inherit}
.auth-lock button{cursor:pointer}

.auth-fallback{
display:grid;
place-items:center;
align-content:center;
gap:10px;
min-height:100svh;
padding:30px;
text-align:center;
background:radial-gradient(circle at 50% 0,#eeeaff 0,#f7f8fc 48%)
}
.auth-fallback h1{font:800 30px/1 Manrope,sans-serif;margin:4px 0}
.auth-fallback p{max-width:360px;color:#73778a;margin:0}

.auth-logo{
width:46px;
height:46px;
object-fit:contain;
display:block
}
.auth-logo.large{
width:108px;
height:108px;
filter:drop-shadow(0 24px 40px rgba(109,93,252,.26))
}

.auth-intro{
position:fixed;
inset:0;
padding:26px clamp(18px,5vw,64px);
background:
radial-gradient(circle at 78% 24%,rgba(157,126,255,.18),transparent 28%),
radial-gradient(circle at 18% 78%,rgba(109,93,252,.10),transparent 25%),
linear-gradient(145deg,#fbfbff,#f0edff);
display:flex;
flex-direction:column;
justify-content:space-between
}

.intro-top,.intro-bottom{
display:flex;
align-items:center;
gap:14px;
font-size:9px;
letter-spacing:.18em;
font-weight:900;
color:#74718a
}
.intro-top{justify-content:space-between}
.intro-bottom i{height:1px;width:80px;background:#cfcbe2}

.intro-hero{
width:min(1100px,100%);
margin:auto;
display:grid;
grid-template-columns:1fr 1fr;
gap:clamp(34px,7vw,90px);
align-items:center
}

.intro-orbit{
min-height:420px;
display:grid;
place-items:center;
position:relative
}

.intro-logo-wrap{
width:190px;
height:190px;
border-radius:52px;
display:grid;
place-items:center;
background:rgba(255,255,255,.72);
border:1px solid rgba(255,255,255,.9);
box-shadow:
0 35px 90px rgba(45,34,94,.16),
inset 0 1px 0 rgba(255,255,255,.9);
backdrop-filter:blur(20px);
animation:authFloat 5s ease-in-out infinite
}

.intro-orbit:before,
.intro-orbit:after{
content:"";
position:absolute;
border:1px solid rgba(109,93,252,.18);
border-radius:50%;
width:330px;
height:330px
}
.intro-orbit:after{
width:410px;
height:410px;
border-color:rgba(109,93,252,.10)
}

.intro-copy{max-width:520px}

.intro-kicker,
.auth-eyebrow{
font-size:10px;
letter-spacing:.2em;
font-weight:900;
color:#6d5dfc;
margin:0 0 14px
}

.intro-copy h1{
font:800 clamp(52px,7vw,86px)/.95 Manrope,sans-serif;
letter-spacing:-4px;
margin:0
}

.intro-copy h1 em,
.auth-side h1 em{
font-style:normal;
color:#6d5dfc
}

.intro-copy>p:not(.intro-kicker){
font-size:16px;
line-height:1.7;
color:#6f7180;
max-width:480px;
margin:24px 0
}

.intro-start{
border:0;
border-radius:17px;
padding:15px 20px 15px 22px;
background:linear-gradient(135deg,#6d5dfc,#a06dff);
color:#fff;
font-weight:900;
box-shadow:0 18px 40px rgba(109,93,252,.28);
display:inline-flex;
align-items:center;
gap:26px
}
.intro-start span{font-size:20px}

.auth-screen{
position:fixed!important;
inset:0!important;
width:100vw!important;
height:100svh!important;
min-height:100svh!important;
overflow:auto!important;
display:grid;
grid-template-columns:minmax(0,1fr) minmax(390px,520px);
background:linear-gradient(135deg,#f7f8fc,#efecff)
}

.auth-side{
min-height:100%;
padding:clamp(28px,5vw,70px);
display:flex;
flex-direction:column;
justify-content:center;
background:
radial-gradient(circle at 80% 20%,rgba(154,125,255,.20),transparent 30%),
linear-gradient(145deg,#f8f9ff,#ece8ff);
position:relative;
overflow:hidden
}

.auth-side-brand{
display:flex;
align-items:center;
gap:10px;
font:800 16px Manrope,sans-serif;
position:absolute;
top:28px;
left:clamp(28px,5vw,70px)
}

.auth-eyebrow{margin-bottom:16px}

.auth-side h1{
font:800 clamp(54px,6vw,86px)/.96 Manrope,sans-serif;
letter-spacing:-4px;
margin:0
}

.auth-rule{
height:1px;
width:min(390px,70%);
background:#d9d6e5;
margin:28px 0
}

.auth-copy{
color:#6e7180;
line-height:1.7;
font-size:15px;
max-width:480px;
margin:0
}

.auth-preview{
display:flex;
gap:9px;
margin-top:30px
}

.auth-preview div{
padding:9px 12px;
border:1px solid rgba(109,93,252,.16);
background:rgba(255,255,255,.56);
border-radius:999px;
color:#6d5dfc;
font-size:9px;
font-weight:900;
letter-spacing:.12em
}

.auth-form-card{
align-self:center;
width:calc(100% - 44px);
max-width:470px;
margin:22px auto;
padding:36px;
border:1px solid rgba(255,255,255,.95);
border-radius:30px;
background:rgba(255,255,255,.90);
box-shadow:
0 30px 100px rgba(45,34,94,.14),
0 4px 18px rgba(45,34,94,.05);
backdrop-filter:blur(24px)
}

.auth-form-heading{margin-top:22px}

.auth-form-heading>span{
font-size:9px;
letter-spacing:.18em;
font-weight:900;
color:#6d5dfc
}

.auth-form-heading h2{
font:800 34px/1.05 Manrope,sans-serif;
letter-spacing:-1.5px;
margin:8px 0
}

.auth-form-heading p{
font-size:13px;
color:#77798a;
margin:0 0 20px;
line-height:1.5
}

/* SIGN UP / SIGN IN TABS */

.auth-tabs{
display:grid;
grid-template-columns:1fr 1fr;
padding:4px;
background:#f0eff5;
border-radius:14px;
margin:22px 0 20px
}

.auth-tab{
height:42px;
border:0;
border-radius:11px;
background:transparent;
color:#77798a;
font-size:12px;
font-weight:900;
transition:.2s ease
}

.auth-tab.active{
background:#fff;
color:#6d5dfc;
box-shadow:0 4px 12px rgba(45,34,94,.08)
}

.google-btn,
.auth-submit{
width:100%;
height:52px;
border-radius:15px;
font-weight:900
}

.google-btn{
border:1px solid #dedde5;
background:#fff;
color:#171827;
display:flex;
align-items:center;
justify-content:center;
gap:11px;
box-shadow:0 6px 20px rgba(25,22,45,.04)
}

.google-svg{
width:21px;
height:21px
}

.auth-or{
display:grid;
grid-template-columns:1fr auto 1fr;
align-items:center;
gap:10px;
color:#a1a0aa;
font-size:10px;
margin:20px 0
}

.auth-or span{
height:1px;
background:#e7e6eb
}

.auth-form-card form{
display:grid;
gap:13px
}

.auth-form-card label{
display:grid;
gap:7px;
font-size:10px;
font-weight:900;
color:#5f6070
}

.auth-form-card input{
width:100%;
height:52px;
border:1px solid #dfdee7;
border-radius:15px;
background:#fbfbfd;
color:#171827;
padding:0 15px;
outline:none
}

.auth-form-card input:focus{
border-color:#9b8cff;
box-shadow:0 0 0 4px rgba(109,93,252,.10);
background:#fff
}

.auth-submit{
border:0;
background:linear-gradient(135deg,#6d5dfc,#9d70ff);
color:#fff;
box-shadow:0 13px 28px rgba(109,93,252,.25)
}

.email-sent{
display:grid;
gap:14px;
text-align:center;
padding:8px 0
}

.email-sent-icon{
font-size:42px
}

.email-sent h3{
font:800 24px/1.1 Manrope,sans-serif;
margin:0
}

.email-sent p{
font-size:13px;
line-height:1.6;
color:#77798a;
margin:0
}

.email-sent strong{
color:#171827
}

.back-link{
border:0;
background:transparent;
color:#6d5dfc;
font-size:11px;
font-weight:800;
margin:2px auto 0;
display:block
}

.auth-msg{
font-size:11px;
line-height:1.5;
color:#6d5dfc;
text-align:center;
margin:13px 0 0
}

.auth-submit:disabled,
.google-btn:disabled{
opacity:.58;
cursor:wait
}

@keyframes authFloat{
0%,100%{transform:translateY(0)}
50%{transform:translateY(-8px)}
}

@media(max-width:850px){
.auth-screen{
display:flex!important;
flex-direction:column!important
}

.auth-side{
min-height:240px;
flex:none;
padding:80px 24px 24px;
justify-content:flex-end
}

.auth-side-brand{
top:20px;
left:24px
}

.auth-side h1{
font-size:52px;
letter-spacing:-2.8px
}

.auth-rule{
margin:17px 0;
width:120px
}

.auth-copy{
font-size:13px
}

.auth-preview{
margin-top:18px
}

.auth-form-card{
width:calc(100% - 24px);
max-width:560px;
margin:12px auto 24px;
padding:25px 20px
}

.intro-hero{
grid-template-columns:1fr;
gap:18px;
text-align:center
}

.intro-orbit{
min-height:260px
}

.intro-orbit:before{
width:230px;
height:230px
}

.intro-orbit:after{
width:285px;
height:285px
}

.intro-logo-wrap{
width:145px;
height:145px
}

.auth-logo.large{
width:84px;
height:84px
}

.intro-copy{
max-width:560px;
margin:auto
}

.intro-copy h1{
font-size:52px;
letter-spacing:-2.8px
}

.intro-copy>p:not(.intro-kicker){
font-size:14px;
margin:17px auto
}

.intro-start{
margin:auto
}
}

@media(max-width:500px){
.auth-side{
min-height:205px;
padding:70px 18px 18px
}

.auth-side-brand{
left:18px
}

.auth-side h1{
font-size:43px
}

.auth-copy{
font-size:12px
}

.auth-preview{
display:none
}

.auth-form-card{
width:calc(100% - 16px);
margin:8px auto 16px;
padding:22px 16px;
border-radius:22px
}

.auth-form-heading h2{
font-size:30px
}

.auth-form-card input,
.auth-submit,
.google-btn{
height:50px
}

.intro-top span:last-child{
display:none
}

.intro-orbit{
min-height:220px
}

.intro-copy h1{
font-size:44px
}

.intro-copy>p:not(.intro-kicker){
font-size:13px
}

.intro-bottom{
font-size:8px
}
}
`;

function Mark({ large = false }: { large?: boolean }) {
  return (
    <img
      className={large ? "auth-logo large" : "auth-logo"}
      src="/mah-buddy-logo.svg"
      alt="Mah Buddy"
    />
  );
}

function GoogleMark() {
  return (
    <svg
      className="google-svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M47.5 24.5c0-1.7-.2-3.4-.5-5H24v9.5h13.2c-.6 3.1-2.4 5.7-5.1 7.5v6.2h8.2c4.8-4.4 7.2-10.8 7.2-18.2Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.9 0 12.7-2.3 16.9-6.2l-8.2-6.2c-2.3 1.5-5.2 2.4-8.7 2.4-6.7 0-12.4-4.5-14.4-10.6H1.1v6.4C5.3 42.2 13.9 48 24 48Z"
      />
      <path
        fill="#FBBC05"
        d="M9.6 27.4c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7v-6.4H1.1C-.4 14.6-1.2 19.2-1.2 24s.8 9.4 2.3 13.4l8.5-6.4Z"
      />
      <path
        fill="#EA4335"
        d="M24 9.6c3.8 0 7.1 1.3 9.7 3.8l7.3-7.3C36.7 2.3 30.9 0 24 0 13.9 0 5.3 5.8 1.1 13.6l8.5 6.4c2-6 7.7-10.5 14.4-10.5Z"
      />
    </svg>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="auth-lock auth-intro">
      <div className="intro-top">
        <span>MAH BUDDY</span>
        <span>YOUR AI STUDY COMPANION</span>
      </div>

      <section className="intro-hero">
        <div className="intro-orbit">
          <div className="intro-logo-wrap">
            <Mark large />
          </div>
        </div>

        <div className="intro-copy">
          <p className="intro-kicker">LEARN · PRACTISE · GROW</p>

          <h1>
            Meet your
            <br />
            <em>Mah Buddy.</em>
          </h1>

          <p>
            Your calm AI study companion for conversations, explanations,
            flashcards, quizzes and voice learning.
          </p>

          <button
            type="button"
            className="intro-start"
            onClick={onStart}
          >
            Get Started <span>→</span>
          </button>
        </div>
      </section>

      <div className="intro-bottom">
        <span>01</span>
        <i />
        <span>READY WHEN YOU ARE</span>
      </div>
    </main>
  );
}

function AuthFallback({ text }: { text: string }) {
  return (
    <main className="auth-lock auth-fallback">
      <Mark />
      <h1>Mah Buddy</h1>
      <p>{text}</p>
    </main>
  );
}

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [started, setStarted] = useState(false);

  const [mode, setMode] = useState<"signup" | "signin">("signup");

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStarted(
        window.sessionStorage.getItem("mah-buddy-onboarding-seen") === "1"
      );
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

    const { data: listener } = auth.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          setAuthLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <AuthFallback text="Add the Supabase environment variables in Vercel to enable accounts." />
    );
  }

  if (authLoading) {
    return <AuthFallback text="Loading your account…" />;
  }

  const auth: AuthClient = supabase;

  if (user) {
    return (
      <>
        <PersistenceBridge userId={user.id} />
        {children}
      </>
    );
  }

  function start() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "mah-buddy-onboarding-seen",
        "1"
      );
    }

    setStarted(true);
  }

  function changeMode(nextMode: "signup" | "signin") {
    setMode(nextMode);
    setEmailSent(false);
    setMessage("");
  }

  async function sendConfirmationEmail(e: FormEvent) {
    e.preventDefault();

    const normalized = email.trim().toLowerCase();

    if (!normalized) return;

    setBusy(true);
    setMessage("");

    const { error } = await auth.auth.signInWithOtp({
      email: normalized,
      options: {
        shouldCreateUser: mode === "signup",
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setEmailSent(true);
    }

    setBusy(false);
  }

  async function google() {
    setBusy(true);
    setMessage("");

    const { error } = await auth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setBusy(false);
      setMessage(error.message);
    }
  }

  if (!started) {
    return <Intro onStart={start} />;
  }

  return (
    <main className="auth-lock auth-screen">
      <style>{AUTH_CSS}</style>

      <section className="auth-side">
        <div className="auth-side-brand">
          <Mark />
          <span>Mah Buddy</span>
        </div>

        <p className="auth-eyebrow">
          YOUR AI STUDY COMPANION
        </p>

        <h1>
          Learn with a
          <br />
          <em>buddy.</em>
        </h1>

        <div className="auth-rule" />

        <p className="auth-copy">
          Create your account or sign back in securely with
          your email. Your Mah Buddy activities stay attached
          to your account when you return.
        </p>

        <div className="auth-preview">
          <div>CHAT</div>
          <div>QUIZ</div>
          <div>VOICE</div>
        </div>
      </section>

      <section className="auth-form-card">
        <Mark />

        {!emailSent ? (
          <>
            <div className="auth-form-heading">
              <span>
                {mode === "signup"
                  ? "CREATE YOUR ACCOUNT"
                  : "WELCOME BACK"}
              </span>

              <h2>
                {mode === "signup"
                  ? "Join Mah Buddy"
                  : "Sign in"}
              </h2>

              <p>
                {mode === "signup"
                  ? "Create your Mah Buddy account using your email."
                  : "Enter your email and we'll send you a secure confirmation link."}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${
                  mode === "signup" ? "active" : ""
                }`}
                onClick={() => changeMode("signup")}
                disabled={busy}
              >
                Sign Up
              </button>

              <button
                type="button"
                className={`auth-tab ${
                  mode === "signin" ? "active" : ""
                }`}
                onClick={() => changeMode("signin")}
                disabled={busy}
              >
                Sign In
              </button>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={google}
              disabled={busy}
            >
              <GoogleMark />
              <span>
                {busy
                  ? "Connecting…"
                  : "Continue with Google"}
              </span>
            </button>

            <div className="auth-or">
              <span />
              or continue with email
              <span />
            </div>

            <form onSubmit={sendConfirmationEmail}>
              <label>
                Email address

                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </label>

              <button
                type="submit"
                className="auth-submit"
                disabled={busy}
              >
                {busy
                  ? "Sending email…"
                  : mode === "signup"
                  ? "Create my account"
                  : "Send sign-in link"}
              </button>
            </form>
          </>
        ) : (
          <div className="email-sent">
            <div className="email-sent-icon">
              ✉️
            </div>

            <div className="auth-form-heading">
              <span>CHECK YOUR EMAIL</span>

              <h2>
                {mode === "signup"
                  ? "Confirm your email"
                  : "Sign-in link sent"}
              </h2>

              <p>
                We sent a secure link to{" "}
                <strong>{email.trim()}</strong>.
                <br />
                Open the email and tap the link to continue
                into Mah Buddy.
              </p>
            </div>

            <button
              type="button"
              className="auth-submit"
              onClick={() => {
                setEmailSent(false);
                setMessage("");
              }}
            >
              Use a different email
            </button>

            <button
              type="button"
              className="back-link"
              onClick={() => {
                setEmailSent(false);
                setMessage("");
              }}
            >
              Back to {mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        )}

        {message && (
          <p className="auth-msg">{message}</p>
        )}
      </section>
    </main>
  );
}