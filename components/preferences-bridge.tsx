"use client";
import { useEffect } from "react";

const accents: Record<string, string> = {
  lilac: "#9b72ff",
  pink: "#e96ca9",
  blue: "#638df7",
  teal: "#59cbb8",
  orange: "#f49a38",
};

export default function PreferencesBridge() {
  useEffect(() => {
    const apply = () => {
      try {
        const p = JSON.parse(localStorage.getItem("mah-buddy-prefs") || "{}");
        const root = document.documentElement;
        root.dataset.mbTheme = p.theme || "light";
        root.dataset.mbAccent = p.accent || "lilac";
        root.dataset.mbReducedMotion = p.reducedMotion ? "true" : "false";
        root.dataset.mbTextScale = p.textSize || "medium";
        root.style.setProperty("--mb-accent", accents[p.accent] || accents.lilac);
        root.style.setProperty("--mb-user-bg", p.background || "#f8f6ff");
        root.style.setProperty(
          "--mb-text-scale",
          p.textSize === "small" ? ".94" : p.textSize === "large" ? "1.08" : "1"
        );
      } catch {
        // Keep the app usable even when local preferences are malformed.
      }
    };

    apply();
    window.addEventListener("storage", apply);
    window.addEventListener("mah-buddy-preferences-changed", apply);
    return () => {
      window.removeEventListener("storage", apply);
      window.removeEventListener("mah-buddy-preferences-changed", apply);
    };
  }, []);

  return null;
}
