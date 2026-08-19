export type AppHealth = {
  supabase: boolean;
  ai: boolean;
  speechSynthesis: boolean;
  speechRecognition: boolean;
};

export function getAppHealth(): AppHealth {
  if (typeof window === "undefined") {
    return { supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), ai: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY), speechSynthesis: false, speechRecognition: false };
  }
  const w = window as any;
  return {
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    ai: true,
    speechSynthesis: "speechSynthesis" in window,
    speechRecognition: Boolean(w.SpeechRecognition || w.webkitSpeechRecognition),
  };
}

export function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/network|failed to fetch/i.test(message)) return "Mah Buddy couldn't reach the service. Check your connection and try again.";
  if (/429|rate limit|quota|credits/i.test(message)) return "Mah Buddy is temporarily busy. Please try again later.";
  if (/auth|unauthorized|jwt|session/i.test(message)) return "Your session needs attention. Please sign in again.";
  return "Mah Buddy couldn't complete that action. Please try again.";
}
