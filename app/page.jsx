import { useState, useRef, useEffect, createContext, useContext } from "react";

function useFontLoader() {
  useEffect(() => {
    const id = "mb-font-playfair";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* The uploaded Mah Buddy master design is intentionally kept as the single source of truth. */
