"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

type StoredMessage = { role: "user" | "assistant" | "system"; content: string; attachment?: unknown };
type StoredChat = { id: string; title: string; messages: StoredMessage[]; updatedAt: number };

/** Keeps the local-first UI backed by the signed-in user's Supabase data. */
export default function PersistenceBridge({ userId, onSignOut }: { userId: string; onSignOut?: () => void }) {
  useEffect(() => {
    if (!supabase || !userId) return;
    const client = supabase;
    let active = true;
    let chatsTimer: ReturnType<typeof setTimeout> | null = null;
    let prefsTimer: ReturnType<typeof setTimeout> | null = null;
    let hydrated = false;

    const persistChats = async (value: string) => {
      if (!active || !hydrated) return;
      try {
        const chats = JSON.parse(value) as StoredChat[];
        const localIds = new Set(chats.map((chat) => chat.id));
        const { data: remote } = await client.from("conversations").select("id").eq("user_id", userId);
        const removedIds = (remote ?? []).map((row) => row.id).filter((id) => !localIds.has(id));
        if (removedIds.length) await client.from("conversations").delete().eq("user_id", userId).in("id", removedIds);
        for (const chat of chats) {
          const { error } = await client.from("conversations").upsert({
            id: chat.id, user_id: userId, title: chat.title || "New chat",
            updated_at: new Date(chat.updatedAt || Date.now()).toISOString(),
          });
          if (error) continue;
          await client.from("messages").delete().eq("conversation_id", chat.id).eq("user_id", userId);
          const rows = chat.messages.map((m) => ({ conversation_id: chat.id, user_id: userId, role: m.role, content: m.content }));
          if (rows.length) await client.from("messages").insert(rows);
        }
      } catch {}
    };

    const persistPrefs = async (value: string) => {
      if (!active || !hydrated) return;
      try {
        const prefs = JSON.parse(value);
        await client.from("user_settings").upsert({
          user_id: userId, theme: prefs.dark ? "dark" : "light", memory_enabled: prefs.memory !== false,
          voice_enabled: prefs.voice !== false, tts_enabled: prefs.voice !== false,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    };

    const scheduleChatsSync = (value: string) => { if (chatsTimer) clearTimeout(chatsTimer); chatsTimer = setTimeout(() => void persistChats(value), 350); };
    const schedulePrefsSync = (value: string) => { if (prefsTimer) clearTimeout(prefsTimer); prefsTimer = setTimeout(() => void persistPrefs(value), 350); };

    const hydrate = async () => {
      try {
        const [{ data: conversations, error: conversationsError }, { data: settings }] = await Promise.all([
          client.from("conversations").select("id,title,created_at,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }),
          client.from("user_settings").select("theme,voice_enabled,tts_enabled,notifications_enabled,memory_enabled,british_english").eq("user_id", userId).maybeSingle(),
        ]);
        if (!active || conversationsError) return;
        const rows = conversations ?? [];
        if (rows.length) {
          const { data: messages } = await client.from("messages").select("id,conversation_id,role,content,created_at").eq("user_id", userId).order("created_at", { ascending: true });
          const byConversation = new Map<string, StoredMessage[]>();
          for (const m of messages ?? []) {
            const list = byConversation.get(m.conversation_id) ?? [];
            list.push({ role: m.role, content: m.content });
            byConversation.set(m.conversation_id, list);
          }
          const chats: StoredChat[] = rows.map((c) => ({ id: c.id, title: c.title, messages: byConversation.get(c.id) ?? [{ role: "assistant", content: "Hey! I'm Mah Buddy 👋\nWhat are we learning today?" }], updatedAt: new Date(c.updated_at).getTime() }));
          localStorage.setItem("mah-buddy-chats", JSON.stringify(chats));
        }
        if (settings) localStorage.setItem("mah-buddy-prefs", JSON.stringify({ dark: settings.theme === "dark", memory: settings.memory_enabled, voice: settings.voice_enabled, instructions: "" }));
        hydrated = true;
        if (rows.length && active && !sessionStorage.getItem("mah-buddy-hydrated")) {
          sessionStorage.setItem("mah-buddy-hydrated", "1");
          window.setTimeout(() => { if (active) window.location.reload(); }, 0);
        }
      } catch { hydrated = true; }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "mah-buddy-chats" && event.newValue) scheduleChatsSync(event.newValue);
      if (event.key === "mah-buddy-prefs" && event.newValue) schedulePrefsSync(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (key === "mah-buddy-chats") scheduleChatsSync(value);
      if (key === "mah-buddy-prefs") schedulePrefsSync(value);
    };
    void hydrate();
    return () => {
      active = false;
      if (chatsTimer) clearTimeout(chatsTimer);
      if (prefsTimer) clearTimeout(prefsTimer);
      window.removeEventListener("storage", onStorage);
      localStorage.setItem = originalSetItem;
    };
  }, [userId]);

  return null;
}
