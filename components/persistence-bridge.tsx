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
            id: chat.id,
            user_id: userId,
            title: chat.title || "New chat",
            updated_at: new Date(chat.updatedAt || Date.now()).toISOString(),
          });
          if (error) continue;

          const { data: existingMessages } = await client
            .from("messages")
            .select("id,role,content")
            .eq("conversation_id", chat.id)
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

          const nextMessages = chat.messages.map((m) => ({ role: m.role, content: m.content }));
          const currentMessages = existingMessages ?? [];
          const unchanged = currentMessages.length === nextMessages.length &&
            currentMessages.every((m, index) => m.role === nextMessages[index].role && m.content === nextMessages[index].content);
          if (unchanged) continue;

          await client.from("messages").delete().eq("conversation_id", chat.id).eq("user_id", userId);
          if (nextMessages.length) {
            await client.from("messages").insert(nextMessages.map((m) => ({
              conversation_id: chat.id,
              user_id: userId,
              role: m.role,
              content: m.content,
            })));
          }
        }
      } catch {
        // Local storage remains the offline source of truth when Supabase is unavailable.
      }
    };

    const persistPrefs = async (value: string) => {
      if (!active || !hydrated) return;
      try {
        const prefs = JSON.parse(value);
        await client.from("user_settings").upsert({
          user_id: userId,
          theme: prefs.dark ? "dark" : "light",
          memory_enabled: prefs.memory !== false,
          voice_enabled: prefs.voice !== false,
          tts_enabled: prefs.voice !== false,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Preferences remain available locally when offline.
      }
    };

    const signOut = async () => {
      try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        onSignOut?.();
        localStorage.removeItem("mah-buddy-chats");
        localStorage.removeItem("mah-buddy-prefs");
        sessionStorage.removeItem("mah-buddy-hydrated");
      } catch (error) {
        console.error("Mah Buddy sign out failed", error);
      }
    };

    const wireSignOut = () => {
      const button = document.querySelector<HTMLButtonElement>(".danger");
      if (!button || button.dataset.mahBuddySignout === "true") return;
      button.dataset.mahBuddySignout = "true";
      button.addEventListener("click", signOut);
      button.setAttribute("aria-label", "Sign out of Mah Buddy");
    };

    const scheduleChatsSync = (value: string) => {
      if (chatsTimer) clearTimeout(chatsTimer);
      chatsTimer = setTimeout(() => void persistChats(value), 500);
    };
    const schedulePrefsSync = (value: string) => {
      if (prefsTimer) clearTimeout(prefsTimer);
      prefsTimer = setTimeout(() => void persistPrefs(value), 500);
    };

    const hydrate = async () => {
      try {
        const [{ data: conversations, error: conversationsError }, { data: settings }] = await Promise.all([
          client.from("conversations").select("id,title,created_at,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }),
          client.from("user_settings").select("theme,voice_enabled,tts_enabled,notifications_enabled,memory_enabled,british_english").eq("user_id", userId).maybeSingle(),
        ]);
        if (!active || conversationsError) {
          hydrated = true;
          wireSignOut();
          return;
        }
        const rows = conversations ?? [];
        if (rows.length) {
          const { data: messages } = await client.from("messages").select("id,conversation_id,role,content,created_at").eq("user_id", userId).order("created_at", { ascending: true });
          const byConversation = new Map<string, StoredMessage[]>();
          for (const m of messages ?? []) {
            const list = byConversation.get(m.conversation_id) ?? [];
            list.push({ role: m.role, content: m.content });
            byConversation.set(m.conversation_id, list);
          }
          const chats: StoredChat[] = rows.map((c) => ({
            id: c.id,
            title: c.title,
            messages: byConversation.get(c.id) ?? [{ role: "assistant", content: "Hey! I'm Mah Buddy 👋\nWhat are we learning today?" }],
            updatedAt: new Date(c.updated_at).getTime(),
          }));
          localStorage.setItem("mah-buddy-chats", JSON.stringify(chats));
        }
        if (settings) localStorage.setItem("mah-buddy-prefs", JSON.stringify({ dark: settings.theme === "dark", memory: settings.memory_enabled, voice: settings.voice_enabled, instructions: "" }));
        hydrated = true;
        wireSignOut();
        if (rows.length && active && !sessionStorage.getItem("mah-buddy-hydrated")) {
          sessionStorage.setItem("mah-buddy-hydrated", "1");
          window.setTimeout(() => { if (active) window.location.reload(); }, 0);
        }
      } catch {
        hydrated = true;
        wireSignOut();
      }
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
    const observer = new MutationObserver(wireSignOut);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      active = false;
      if (chatsTimer) clearTimeout(chatsTimer);
      if (prefsTimer) clearTimeout(prefsTimer);
      window.removeEventListener("storage", onStorage);
      localStorage.setItem = originalSetItem;
      observer.disconnect();
    };
  }, [userId, onSignOut]);

  return null;
}
