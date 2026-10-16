export default function Loading() {
  return (
    <main className="mb-loading-page" role="status" aria-live="polite">
      <div className="mb-loading-brand">
        <img src="/mah-buddy-logo.svg" alt="" width="58" height="58" />
        <span>Mah Buddy</span>
      </div>
      <p>Getting your space ready…</p>
      <div className="mb-living-bars" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{animationDelay:`${i*70}ms`}} />)}</div>
    </main>
  );
}
