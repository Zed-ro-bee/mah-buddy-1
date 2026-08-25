"use client";

import { useEffect } from "react";
import { speakMahBuddy, stopMahBuddyVoice } from "../lib/voice";

const STYLE_ID = "mah-buddy-tts-style";
const SETTING_ID = "mah-buddy-tts-setting";

function speakerSvg(size = 17) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M18.5 7a7.5 7.5 0 0 1 0 10"/></svg>`;
}

function getAnswerText(message: Element) {
  const body = message.querySelector(".mb-msg-body");
  if (!body) return "";
  const copy = body.cloneNode(true) as HTMLElement;
  copy.querySelectorAll("button, svg, .mb-tts-button").forEach((el) => el.remove());
  return copy.textContent?.trim() || "";
}

function injectSettingsControl() {
  const settings = document.querySelector(".mb-settings");
  if (!settings || settings.querySelector(`#${SETTING_ID}`)) return;
  const sections = settings.querySelectorAll(".mb-settings-section");
  const section = sections[sections.length - 1] as HTMLElement | undefined;
  if (!section) return;

  const card = document.createElement("div");
  card.id = SETTING_ID;
  card.className = "mb-setting-card mb-tts-setting-premium";
  const enabled = localStorage.getItem("mb-auto-speak") === "true";
  card.innerHTML = `<div class="mb-setting-icon mb-tts-premium-icon">${speakerSvg(19)}</div><div class="mb-setting-copy"><strong>Mah Buddy voice <em>PREMIUM</em></strong><span>Automatically read every Mah Buddy answer aloud.</span></div><button type="button" class="mb-theme-switch mb-tts-setting-toggle" aria-label="Toggle Mah Buddy voice"><span class="${enabled ? "on" : ""}"></span></button>`;
  const toggle = card.querySelector(".mb-tts-setting-toggle") as HTMLButtonElement;
  toggle?.addEventListener("click", () => {
    const next = localStorage.getItem("mb-auto-speak") !== "true";
    localStorage.setItem("mb-auto-speak", String(next));
    const dot = toggle.querySelector("span");
    dot?.classList.toggle("on", next);
    window.dispatchEvent(new Event("mah-buddy-tts-preference-changed"));
  });
  section.appendChild(card);
}

export default function TtsLayer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .mb-tts-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:36px;height:32px;margin-top:9px;border:1px solid var(--vline);border-radius:11px;background:color-mix(in srgb,var(--vsurface) 94%,var(--vsoft));color:var(--vmuted);box-shadow:0 5px 16px rgba(20,18,40,.05);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,color .16s ease,border-color .16s ease}.mb-tts-button:hover{transform:translateY(-1px);color:var(--vbrand);border-color:#c9c2ff;box-shadow:0 9px 22px rgba(109,93,252,.14)}.mb-tts-button.is-speaking{color:var(--vbrand);background:var(--vsoft);border-color:#aaa0ff;box-shadow:0 0 0 3px rgba(109,93,252,.10),0 9px 22px rgba(109,93,252,.14)}.mb-tts-button.is-speaking svg{animation:mbTtsPulse 1s ease-in-out infinite}@keyframes mbTtsPulse{50%{transform:scale(1.08)}}
        .mb-tts-setting-premium{background:linear-gradient(135deg,color-mix(in srgb,var(--vsurface) 94%,var(--vsoft)),color-mix(in srgb,var(--vsoft) 55%,var(--vsurface)));border-color:#c9c2ff;box-shadow:0 8px 24px rgba(109,93,252,.10)}.mb-tts-premium-icon{background:linear-gradient(135deg,#6d5dfc,#b85cff)!important;color:#fff!important;box-shadow:0 8px 18px rgba(109,93,252,.25)}.mb-tts-setting-premium em{font-style:normal;font-size:8px;letter-spacing:.08em;margin-left:5px;padding:3px 6px;border-radius:999px;color:#fff;background:linear-gradient(135deg,#6d5dfc,#b85cff)}.mb-tts-setting-toggle:has(span.on){background:linear-gradient(135deg,#6d5dfc,#b85cff)!important}
      `;
      document.head.appendChild(style);
    }

    const attach = (message: Element, autoSpeak: boolean) => {
      if (message.classList.contains("user") || message.querySelector(".mb-tts-button")) return;
      const body = message.querySelector(".mb-msg-body");
      if (!body) return;
      const text = getAnswerText(message);
      if (!text) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mb-tts-button";
      button.setAttribute("aria-label", "Listen to Mah Buddy response");
      button.title = "Listen to response";
      button.innerHTML = speakerSvg();
      let speaking = false;
      const stop = () => { stopMahBuddyVoice(); speaking = false; button.classList.remove("is-speaking"); button.innerHTML = speakerSvg(); };
      button.addEventListener("click", () => {
        if (speaking) { stop(); return; }
        const ok = speakMahBuddy(text, { enabled: true, rate: 1, pitch: 1 });
        if (!ok) return;
        speaking = true;
        document.querySelectorAll<HTMLButtonElement>(".mb-tts-button.is-speaking").forEach((other) => { if (other !== button) other.click(); });
        button.classList.add("is-speaking");
        button.innerHTML = speakerSvg();
        window.speechSynthesis?.addEventListener?.("end", stop, { once: true });
        window.speechSynthesis?.addEventListener?.("error", stop, { once: true });
      });
      body.appendChild(button);
      if (autoSpeak) button.click();
    };

    const root = document.querySelector(".mb-shell") || document.body;
    const existing = root.querySelectorAll(".mb-msg:not(.user)");
    existing.forEach((message) => attach(message, false));
    injectSettingsControl();

    const observer = new MutationObserver((records) => {
      const autoSpeak = localStorage.getItem("mb-auto-speak") === "true";
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(".mb-msg:not(.user)")) attach(node, autoSpeak);
        node.querySelectorAll?.(".mb-msg:not(.user)").forEach((message) => attach(message, autoSpeak));
        if (node.matches(".mb-settings") || node.querySelector?.(".mb-settings")) injectSettingsControl();
      }));
      injectSettingsControl();
    });
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("mah-buddy-tts-preference-changed", injectSettingsControl);
    return () => { observer.disconnect(); window.removeEventListener("mah-buddy-tts-preference-changed", injectSettingsControl); document.getElementById(STYLE_ID)?.remove(); };
  }, []);

  return <>{children}</>;
}
