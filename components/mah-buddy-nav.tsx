"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    chat: <><path d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/><path d="M7.5 10h9M7.5 13h5"/></>,
    cards: <><rect x="5" y="5" width="13" height="15" rx="2"/><path d="M8 3h9a2 2 0 0 1 2 2v12"/><path d="M8.5 10h6M8.5 13h4"/></>,
    quiz: <><circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
    profile: <><circle cx="12" cy="8.5" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    settings: <><path d="m9.7 3.8.6-1h3.4l.6 1a8.8 8.8 0 0 1 1.8 1l1.1-.1 1.7 1.7-.1 1.1a8.8 8.8 0 0 1 1 1.8l1 .6v3.4l-1 .6a8.8 8.8 0 0 1-1 1.8l.1 1.1-1.7 1.7-1.1-.1a8.8 8.8 0 0 1-1.8 1l-.6 1H10l-.6-1a8.8 8.8 0 0 1-1.8-1l-1.1.1-1.7-1.7.1-1.1a8.8 8.8 0 0 1-1-1.8l-1-.6V9.9l1-.6a8.8 8.8 0 0 1 1-1.8l-.1-1.1 1.7-1.7 1.1.1a8.8 8.8 0 0 1 1.8-1Z"/><circle cx="12" cy="11.6" r="2.7"/></>
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function MahBuddyNav() {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let mounted = true; const auth = supabase;
    auth.auth.getSession().then(({ data }) => { if (mounted) { setSignedIn(Boolean(data.session?.user)); setReady(true); } });
    const { data: listener } = auth.auth.onAuthStateChange((_event, session) => { if (mounted) { setSignedIn(Boolean(session?.user)); setReady(true); } });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);
  if (!ready || !signedIn || path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) return null;
  const items = [["/", "chat", "Chat"], ["/flashcards", "cards", "Cards"], ["/quiz", "quiz", "Quiz"], ["/profile", "profile", "Profile"], ["/settings", "settings", "Settings"]] as const;
  return <nav className="mah-buddy-nav" aria-label="Main navigation"><div className="nav-glow"/><div className="mah-buddy-nav-inner">{items.map(([href, icon, label]) => <a key={href} href={href} className={path === href ? "active" : ""} aria-current={path === href ? "page" : undefined}><span className="nav-icon"><Icon name={icon}/></span><small>{label}</small></a>)}</div><style jsx>{` .mah-buddy-nav{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:1000;width:min(700px,calc(100% - 22px));height:74px;padding:7px;border:1px solid rgba(255,255,255,.92);border-radius:26px;background:rgba(250,249,253,.88);backdrop-filter:blur(30px) saturate(170%);box-shadow:0 26px 70px rgba(29,24,58,.20),0 4px 18px rgba(29,24,58,.07),inset 0 1px 0 #fff}.mah-buddy-nav-inner{height:100%;display:flex;gap:5px;position:relative;z-index:1}.mah-buddy-nav a{position:relative;flex:1;text-decoration:none;color:#9b97a5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:20px;transition:.2s ease}.mah-buddy-nav a:hover{color:#705ff4;background:rgba(239,236,255,.72);transform:translateY(-2px)}.mah-buddy-nav a.active{color:#fff;background:linear-gradient(145deg,#6858f4,#9b6cff);box-shadow:0 10px 25px rgba(105,88,244,.30),inset 0 1px 0 rgba(255,255,255,.32)}.nav-icon{width:30px;height:30px;display:grid;place-items:center}.nav-icon svg{width:22px;height:22px}.mah-buddy-nav small{font-size:8px;letter-spacing:.02em;font-weight:850}.mah-buddy-nav a.active:after{content:"";position:absolute;bottom:5px;width:4px;height:4px;border-radius:50%;background:#fff}@media(max-width:600px){.mah-buddy-nav{height:68px;bottom:9px;border-radius:23px}.mah-buddy-nav a{border-radius:18px}.nav-icon svg{width:21px;height:21px}.mah-buddy-nav small{font-size:7.5px}} `}</style></nav>;
}
