"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Mah Buddy UI error:", error);
  }, [error]);

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-mark auth-mark">MB</div>
        <h1>Something went wrong</h1>
        <p>Mah Buddy hit a temporary problem. Try again or reload the app.</p>
        <button className="auth-submit" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
