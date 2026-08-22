"use client";
import { useEffect } from "react";
const accents:Record<string,string>={lilac:"#7468e8",blue:"#6488d8",pink:"#d47b9c",navy:"#30384f"};
export default function PreferencesBridge(){useEffect(()=>{const apply=()=>{try{const p=JSON.parse(localStorage.getItem("mah-buddy-prefs")||"{}");const root=document.documentElement;root.dataset.mbTheme=p.theme||"system";root.dataset.mbAccent=p.accent||"lilac";root.dataset.mbReducedMotion=p.reducedMotion?"true":"false";root.dataset.mbTextScale=p.textSize||"medium";root.style.setProperty("--mb-accent",accents[p.accent]||accents.lilac)}catch{}};apply();window.addEventListener("storage",apply);return()=>window.removeEventListener("storage",apply)},[]);return null}
