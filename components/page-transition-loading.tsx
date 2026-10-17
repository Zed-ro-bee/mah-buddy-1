"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function pageName(path: string) {
  const clean = path.split("?")[0].replace(/\/+$/, "");
  const names: Record<string, string> = {
    "/": "AI Assistance",
    "/study": "Study",
    "/quiz": "Quiz",
    "/flashcards": "Flashcards",
    "/library": "Library",
    "/profile": "Profile",
    "/settings": "Settings",
    "/about-mah-buddy": "About Mah Buddy",
  };
  if (names[clean]) return names[clean];
  const last = clean.split("/").filter(Boolean).pop();
  return last ? last.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "your space";
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
    <div
      className="mb-route-loading"
      role="status"
      aria-live="polite"
      aria-label={`Opening ${label}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "calc(16px + env(safe-area-inset-top)) 14px 14px",
        background: "rgba(10,16,12,.38)",
        backdropFilter: "blur(3px)",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#F0F4F0",
      }}
    >
      <div
        className="mb-route-loading-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "min(100%, 390px)",
          padding: "13px 15px",
          border: "1px solid #385344",
          borderRadius: 16,
          background: "rgba(29,41,34,.98)",
          boxShadow: "0 12px 36px rgba(0,0,0,.28)",
        }}
      >
        <span
          className="mb-route-spinner"
          aria-hidden="true"
          style={{ flex: "0 0 20px", width: 20, height: 20, border: "2px solid #395548", borderTopColor: "#9BE8F4", borderRadius: "50%", animation: "mb-spin 700ms linear infinite" }}
        />
        <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <strong style={{ color: "#F0F4F0", fontSize: 13, fontWeight: 700 }}>Opening {label}</strong>
          <small style={{ color: "#A0ACA3", fontSize: 11 }}>Getting everything ready…</small>
        </span>
      </div>
      <style>{`@keyframes mb-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.mb-route-spinner{animation:none!important}}`}</style>
    </div>
  );
}
