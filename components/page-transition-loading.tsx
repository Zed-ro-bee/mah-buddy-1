"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function pageName(path: string) {
  const clean = path.split("?")[0].replace(/\/+$/, "");
  const names: Record<string,string> = {
    "/": "AI Assistance",
    "/study": "Study",
    "/quiz": "Quiz",
    "/flashcards": "Flashcards",
    "/library": "Library",
    "/profile": "Profile",
    "/settings": "Settings",
    "/about-mah-buddy": "About Mah Buddy"
  };
  if (names[clean]) return names[clean];
  const last = clean.split("/").filter(Boolean).pop();
  return last ? last.replace(/[-_]/g," ").replace(/\b\w/g, c => c.toUpperCase()) : "your space";
}

export default function PageTransitionLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(false);
    setLabel("");
    if (timer.current) clearTimeout(timer.current);
    if (failsafe.current) clearTimeout(failsafe.current);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || anchor.href.includes("#")) return;
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
      event.preventDefault();
      setLabel(pageName(url.pathname));
      setVisible(false);
      if (timer.current) clearTimeout(timer.current);
      if (failsafe.current) clearTimeout(failsafe.current);
      timer.current = setTimeout(() => setVisible(true), 110);
      failsafe.current = setTimeout(() => setVisible(false), 8000);
      router.push(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (timer.current) clearTimeout(timer.current);
      if (failsafe.current) clearTimeout(failsafe.current);
    };
  }, [router]);

  if (!visible) return null;
  return (
    <div className="mb-route-loading" role="status" aria-live="polite" aria-label={`Opening ${label}}>
      <div className="mb-route-loading-card">
        <span className="mb-route-spinner" aria-hidden="true" />
        <span className="mb-route-loading-copy"><strong>Opening {label}</strong><small>Getting everything ready…</small></span>
      </div>
    </div>
  );
}
