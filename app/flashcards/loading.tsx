export default function FlashcardsLoading() {
  return (
    <main className="mb-study-loading" role="status" aria-live="polite" aria-label="Preparing flashcards">
      <header><span className="mb-loading-spinner" /><div><strong>Preparing your flashcards</strong><small>Building your revision deck…</small></div></header>
      <section className="mb-loading-flashcard">
        <i className="mb-skeleton mb-skeleton-short" /><i className="mb-skeleton mb-skeleton-wide" /><i className="mb-skeleton mb-skeleton-medium" />
      </section>
    </main>
  );
}
