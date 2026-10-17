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
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function MahBuddyNav() {
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

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

  useEffect(() => {
    if (!ready || !signedIn || path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) {
      document.body.classList.remove("mb-has-global-nav", "mb-keyboard-open");
      return;
    }

    document.body.classList.add("mb-has-global-nav");
    const viewport = window.visualViewport;
    const updateKeyboard = () => {
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const open = isMobile && Boolean(viewport && window.innerHeight - viewport.height > 130);
      setKeyboardOpen(open);
      document.body.classList.toggle("mb-keyboard-open", open);
    };
    updateKeyboard();
    viewport?.addEventListener("resize", updateKeyboard);
    window.addEventListener("resize", updateKeyboard);
    return () => {
      viewport?.removeEventListener("resize", updateKeyboard);
      window.removeEventListener("resize", updateKeyboard);
      document.body.classList.remove("mb-has-global-nav", "mb-keyboard-open");
    };
  }, [ready, signedIn, path]);

  if (!ready || !signedIn || keyboardOpen || path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) return null;

  const items = [
    ["/study", "home", "Home"],
    ["/", "orbit", "AI Assistance"],
    ["/library", "resources", "Resources"],
    ["/profile", "profile", "Profile"]
  ] as const;

  return (
    <nav className="mah-buddy-nav" aria-label="Main navigation">
      <div className="mah-buddy-nav-brand"><span className="mah-buddy-nav-mark">m<span>.</span></span><span>Mah Buddy</span></div>
      <div className="mah-buddy-nav-inner">
        {items.map(([href, icon, label]) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
          return (
            <a key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <span className="nav-icon"><Icon name={icon} /></span>
              <span className="nav-label">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
