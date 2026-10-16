export default function QuizLoading() {
  return (
    <main className="mb-study-loading" role="status" aria-live="polite" aria-label="Preparing quiz">
      <header><span className="mb-loading-spinner" /><div><strong>Preparing your quiz</strong><small>Getting your questions ready…</small></div></header>
      <section className="mb-loading-panel">
        <i className="mb-skeleton mb-skeleton-short" /><i className="mb-skeleton mb-skeleton-wide" /><i className="mb-skeleton mb-skeleton-medium" />
        <div className="mb-skeleton-options">{[1,2,3,4].map(n=><i className="mb-skeleton" key={n}/>)}</div>
      </section>
    </main>
  );
}
