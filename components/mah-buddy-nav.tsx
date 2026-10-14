"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5.5 9v11h13V9"/><path d="M9.5 20v-6h5v6"/></>,
    orbit: <><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(35 12 12)"/></>,
    resources: <><path d="M2.8 5.5c3.1-1.3 6.2-.9 9.2 1.2v13c-3-2.1-6.1-2.5-9.2-1.2z"/><path d="M21.2 5.5C18.1 4.2 15 4.6 12 6.7v13c3-2.1 6.1-2.5 9.2-1.2z"/><path d="M5.5 9h3M5.5 12h3M15.5 9h3M15.5 12h3"/></>,
    profile: <><circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></>
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function MahBuddyNav() {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let mounted = true;
    const auth = supabase;
    auth.auth.getSession().then(({ data }) => {
      if (mounted) { setSignedIn(Boolean(data.session?.user)); setReady(true); }
    });
    const { data: listener } = auth.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setSignedIn(Boolean(session?.user)); setReady(true); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!ready || !signedIn || path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) return null;

  const items = [
    ["/study", "home", "Home"],
    ["/", "orbit", "AI Assistance"],
    ["/library", "resources", "Resources"],
    ["/profile", "profile", "Profile"]
  ] as const;

  return (
    <nav className="mah-buddy-nav" aria-label="Main navigation">
      <div className="mah-buddy-nav-inner">
        {items.map(([href, icon, label]) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
          return (
            <a key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <span className="nav-icon"><Icon name={icon} /></span>
              <small>{label}</small>
            </a>
          );
        })}
      </div>
      <style jsx>{`
        .mah-buddy-nav{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:1000;width:min(700px,calc(100% - 22px));height:74px;padding:7px;border:1px solid rgba(222,242,232,.13);border-radius:26px;background:rgba(17,28,25,.96);backdrop-filter:blur(30px) saturate(150%);box-shadow:0 20px 55px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.035)}
        .mah-buddy-nav-inner{height:100%;display:flex;gap:5px;position:relative}
        .mah-buddy-nav a{position:relative;flex:1;min-width:0;text-decoration:none;color:#a8b7af;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:20px;transition:background .18s ease,color .18s ease}
        .mah-buddy-nav a:hover{color:#dceee6;background:rgba(185,232,244,.06)}
        .mah-buddy-nav a.active{color:#153b32;background:#b9e8f4;box-shadow:0 5px 18px rgba(112,190,208,.14)}
        .nav-icon{width:30px;height:30px;display:grid;place-items:center}
        .nav-icon svg{width:23px;height:23px}
        .mah-buddy-nav small{font-size:10px;line-height:1.1;letter-spacing:-.01em;font-weight:750;white-space:nowrap}
        @media(max-width:600px){.mah-buddy-nav{height:68px;bottom:9px;border-radius:23px;width:calc(100% - 22px)}.mah-buddy-nav a{border-radius:18px;gap:3px}.nav-icon{width:29px;height:29px}.nav-icon svg{width:22px;height:22px}.mah-buddy-nav small{font-size:9px}}
        @media(max-width:360px){.mah-buddy-nav{padding:5px}.mah-buddy-nav-inner{gap:2px}.mah-buddy-nav small{font-size:8px}}
      `}</style>
    </nav>
  );
}
