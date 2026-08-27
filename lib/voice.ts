export type VoiceSettings = {
  enabled: boolean;
  voiceName?: string;
  rate?: number;
  pitch?: number;
};

/**
 * Prepare the already-rendered answer for speech without rewriting it.
 * Punctuation, wording, sentence order, question marks, exclamation marks,
 * commas, colons and semicolons are intentionally preserved so the TTS engine
 * can use them for natural phrasing and pauses.
 */
export function cleanSpeechText(text: string) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function speakMahBuddy(text: string, settings: VoiceSettings = { enabled: true }) {
  if (!settings.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const speechText = cleanSpeechText(text);
  if (!speechText) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = "en-GB";
  utterance.rate = settings.rate ?? 0.98;
  utterance.pitch = settings.pitch ?? 1;
  const voices = getSpeechVoices();
  const preferred = settings.voiceName
    ? voices.find((voice) => voice.name === settings.voiceName)
    : voices.find((voice) => /^en-GB/i.test(voice.lang)) || voices.find((voice) => /British|UK|English.*GB/i.test(voice.name)) || voices.find((voice) => /^en/i.test(voice.lang));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopMahBuddyVoice() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function isVoiceInputSupported() {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createVoiceInput(onText: (text: string) => void, onState?: (listening: boolean) => void) {
  if (typeof window === "undefined") return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onstart = () => onState?.(true);
  recognition.onend = () => onState?.(false);
  recognition.onresult = (event: any) => {
    const text = event.results?.[0]?.[0]?.transcript?.trim();
    if (text) onText(text);
  };
  recognition.onerror = () => onState?.(false);
  return recognition as { start: () => void; stop: () => void };
}
