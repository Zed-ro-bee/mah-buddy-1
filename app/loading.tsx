"use client";

export default function Loading() {
  return (
    <main
      className="mb-loading-page"
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 28,
        background: "#141916",
        color: "#F0F4F0",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 22, fontWeight: 700, letterSpacing: "-.04em" }}>
        <img src="/mah-buddy-logo.svg" alt="" width="58" height="58" style={{ display: "block", width: 58, height: 58, objectFit: "contain", borderRadius: 16 }} />
        <span>Mah Buddy</span>
      </div>
      <p style={{ margin: 0, color: "#A0ACA3", fontSize: 13 }}>Getting your space ready…</p>
      <div aria-hidden="true" style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} style={{ display: "block", width: 4, height: i % 4 === 3 ? 23 : i % 3 === 2 ? 17 : 9, borderRadius: 999, background: "#9BE8F4", animation: "mb-living-bars 900ms ease-in-out infinite alternate", animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
      <style>{`@keyframes mb-living-bars{from{transform:scaleY(.48);opacity:.45}to{transform:scaleY(1);opacity:1}}@media(prefers-reduced-motion:reduce){.mb-loading-page i{animation:none!important}}`}</style>
    </main>
  );
}
