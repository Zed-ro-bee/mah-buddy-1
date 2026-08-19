"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

type StoredMessage = { role: "user" | "assistant" | "system"; content: string; attachment?: unknown };
type StoredChat = { id: string; title: string; messages: StoredMessage[]; updatedAt: number };

export default function PersistenceBridge({ userId }: { userId: string }) {
  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    const client = supabase;

    const hydrate = async () => {
      const [{ data: conversations }, { data: settings }] = await Promise.all([
        client.from("conversations").select("id,title,created_at,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }),
        client.from("user_settings").select("theme,voice_enabled,voice_name,notifications_enabled,memory_enabled").eq("user_id", userId).maybeSingle(),
      ]);
      if (!active) return;
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
        window.dispatchEvent(new Event("mah-buddy-hydrated"));
      }
      if (settings) {
        localStorage.setItem("mah-buddy-prefs", JSON.stringify({
          dark: settings.theme === "dark",
          memory: settings.memory_enabled,
          instructions: "",
        }));
      }
    };

    const persistChats = async (value: string) => {
      try {
        const chats = JSON.parse(value) as StoredChat[];
        for (const chat of chats) {
          const { error } = await client.from("conversations").upsert({
            id: chat.id,
            user_id: userId,
            title: chat.title || "New chat",
            updated_at: new Date(chat.updatedAt || Date.now()).toISOString(),
          });
          if (error) continue;
          await client.from("messages").delete().eq("conversation_id", chat.id).eq("user_id", userId);
          const messages = chat.messages.map((m) => ({ conversation_id: chat.id, user_id: userId, role: m.role, content: m.content }));
          if (messages.length) await client.from("messages").insert(messages);
        }
      } catch {}
    };

    const persistPrefs = async (value: string) => {
      try {
        const prefs = JSON.parse(value);
        await client.from("user_settings").upsert({
          user_id: userId,
          theme: prefs.dark ? "dark" : "light",
          memory_enabled: prefs.memory !== false,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    };

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalGetItem = localStorage.getItem.bind(localStorage);
    localStorage.setItem = function (key: string, value: string) {
      originalSetItem(key, value);
      if (key === "mah-buddy-chats") void persistChats(value);
      if (key === "mah-buddy-prefs") void persistPrefs(value);
    };

    void hydrate();
    return () => {
      active = false;
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    };
  }, [userId]);

  return null;
}
