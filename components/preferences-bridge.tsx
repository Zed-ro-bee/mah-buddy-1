"use client";
import { useEffect } from "react";

const accents: Record<string, string> = {
  lilac: "#9b72ff",
  pink: "#e96ca9",
  blue: "#638df7",
  teal: "#59cbb8",
  orange: "#f49a38",
};

function resolvedTheme(value: string) {
  if (value === "dark") return "dark";
  if (value === "light") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function PreferencesBridge() {
  useEffect(() => {
    const apply = () => {
      try {
        const p = JSON.parse(localStorage.getItem("mah-buddy-prefs") || "{}");
        const root = document.documentElement;
        const theme = resolvedTheme(String(p.theme || "system").toLowerCase());
        root.dataset.mbTheme = theme;
        root.dataset.theme = theme;
        root.dataset.mbAccent = p.accent || "lilac";
        root.dataset.mbReducedMotion = p.reducedMotion ? "true" : "false";
        root.dataset.mbTextScale = p.textSize || "medium";
        root.style.setProperty("--mb-accent", accents[p.accent] || accents.lilac);
        root.style.setProperty("--mb-user-bg", p.background || "#f8f6ff");
        root.style.setProperty("--mb-text-scale", p.textSize === "small" ? ".94" : p.textSize === "large" ? "1.08" : "1");
        localStorage.setItem("mb-theme", theme === "dark" ? "Dark" : "Light");
        if (typeof p.voice === "boolean") localStorage.setItem("mb-voice", String(p.voice));
        if (typeof p.enterToSend === "boolean") localStorage.setItem("mb-enter", String(p.enterToSend));
      } catch {
        // Keep the app usable even when local preferences are malformed.
      }
    };

    apply();
    window.addEventListener("storage", apply);
    window.addEventListener("mah-buddy-preferences-changed", apply);
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", apply);
    return () => {
      window.removeEventListener("storage", apply);
      window.removeEventListener("mah-buddy-preferences-changed", apply);
      media?.removeEventListener?.("change", apply);
    };
  }, []);

  return null;
}
