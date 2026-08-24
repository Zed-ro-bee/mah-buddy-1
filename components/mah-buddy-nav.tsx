"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function MahBuddyNav() {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); setSignedIn(false); return; }
    let mounted = true;
    const auth = supabase;
    auth.auth.getSession().then(({ data }) => { if (mounted) { setSignedIn(Boolean(data.session?.user)); setReady(true); } });
    const { data: listener } = auth.auth.onAuthStateChange((_event, session) => { if (mounted) { setSignedIn(Boolean(session?.user)); setReady(true); } });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!ready || !signedIn) return null;
  if (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) return null;

  const items = [
    ["/", "⌂", "Chat"],
    ["/flashcards", "▣", "Cards"],
    ["/quiz", "✓", "Quiz"],
    ["/profile", "◉", "Profile"],
    ["/settings", "⚙", "Settings"],
  ] as const;

  return <nav className="mah-buddy-nav" aria-label="Main navigation">
    <div className="mah-buddy-nav-inner">
      {items.map(([href, icon, label]) => <a key={href} href={href} className={path === href ? "active" : ""} aria-current={path === href ? "page" : undefined}>
        <span aria-hidden="true">{icon}</span><small>{label}</small>
      </a>)}
    </div>
    <style jsx>{`
      .mah-buddy-nav{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:1000;width:min(680px,calc(100% - 24px));height:68px;padding:7px;border:1px solid rgba(255,255,255,.76);border-radius:24px;background:rgba(255,255,255,.84);backdrop-filter:blur(28px) saturate(150%);box-shadow:0 24px 70px rgba(30,24,62,.20),0 2px 10px rgba(30,24,62,.06),inset 0 1px 0 rgba(255,255,255,.9)}
      .mah-buddy-nav-inner{height:100%;display:flex;gap:4px}
      .mah-buddy-nav a{position:relative;flex:1;text-decoration:none;color:#9693a0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:18px;font-size:19px;transition:transform .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease}
      .mah-buddy-nav a:hover{transform:translateY(-2px);color:#6d5dfc;background:rgba(240,237,255,.72)}
      .mah-buddy-nav a.active{color:#fff;background:linear-gradient(135deg,#6d5dfc,#9a70ff);box-shadow:0 9px 22px rgba(109,93,252,.28),inset 0 1px 0 rgba(255,255,255,.24)}
      .mah-buddy-nav a.active:after{content:"";position:absolute;bottom:4px;width:4px;height:4px;border-radius:50%;background:#fff;opacity:.9}
      .mah-buddy-nav a span{line-height:1;font-size:20px}.mah-buddy-nav small{font-size:8px;letter-spacing:.02em;font-weight:800}
      @media(max-width:700px){.mah-buddy-nav{width:calc(100% - 20px);height:64px;bottom:8px;border-radius:22px}.mah-buddy-nav a{border-radius:17px}.mah-buddy-nav a span{font-size:19px}}
    `}</style>
  </nav>;
}
