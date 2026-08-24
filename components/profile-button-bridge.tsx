"use client";
import {useEffect} from "react";

/** Keeps the existing home UI unchanged while making its profile/user control open the real profile page. */
export default function ProfileButtonBridge(){
  useEffect(()=>{
    const handler=(event:MouseEvent)=>{
      const target=event.target as HTMLElement|null;
      const button=target?.closest("button,a,[role='button']") as HTMLElement|null;
      if(!button) return;
      if(button.closest("[data-profile-bridge-ignore='true']")) return;
      const label=(button.getAttribute("aria-label")||button.getAttribute("title")||button.textContent||"").trim().toLowerCase();
      const svg=button.querySelector("svg")?.outerHTML||"";
      const looksLikeProfile=/\b(profile|account|my profile|your profile|user)\b/.test(label)
        || (svg.includes('cx="12" cy="8" r="3"') && svg.includes('M5 21a7 7 0 0 1 14 0'));
      if(!looksLikeProfile) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign("/profile");
    };
    document.addEventListener("click",handler,true);
    return()=>document.removeEventListener("click",handler,true);
  },[]);
  return null;
}
