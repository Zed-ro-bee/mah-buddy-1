"use client";

import { usePathname } from "next/navigation";

export default function MahBuddyNav() {
  const path = usePathname();
  if (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth")) return null;

  const items = [
    ["/", "⌂", "Chat"],
    ["/flashcards", "▣", "Cards"],
    ["/quiz", "✓", "Quiz"],
    ["/profile", "◉", "Profile"],
    ["/settings", "⚙", "Settings"],
  ] as const;

  return (
    <nav className="mah-buddy-nav">
      {items.map(([href, icon, label]) => (
        <a key={href} href={href} className={path === href ? "active" : ""}>
          <span>{icon}</span>
          <small>{label}</small>
        </a>
      ))}
      <style jsx>{`.mah-buddy-nav{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:70;width:min(620px,calc(100% - 24px));height:62px;padding:6px;border:1px solid #e4e4ea;border-radius:20px;background:rgba(255,255,255,.92);backdrop-filter:blur(18px);box-shadow:0 14px 45px rgba(20,18,40,.15);display:flex}.mah-buddy-nav a{flex:1;text-decoration:none;color:#85818d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:15px;font-size:18px}.mah-buddy-nav a.active{color:#6d5dfc;background:#f0edff}.mah-buddy-nav small{font-size:9px;font-weight:750}@media(max-width:700px){.mah-buddy-nav{bottom:8px;height:58px;border-radius:18px}.mah-buddy-nav a{font-size:16px}}`}</style>
    </nav>
  );
}
