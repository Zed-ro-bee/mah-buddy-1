import { supabase } from "./supabase";

const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 100_000;

function cleanTitle(title: string) {
  return String(title ?? "New chat").trim().slice(0, MAX_TITLE_LENGTH) || "New chat";
}

function cleanMessage(content: string) {
  return String(content ?? "").slice(0, MAX_MESSAGE_LENGTH);
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function ensureConversation(title = "New chat") {
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title: cleanTitle(title) })
    .select("id,title,created_at,updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function saveMessage(conversationId: string, role: "user" | "assistant" | "system", content: string) {
  if (!supabase || !conversationId) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const safeContent = cleanMessage(content);
  if (!safeContent) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, user_id: user.id, role, content: safeContent })
    .select("id,conversation_id,role,content,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function listConversations() {
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,created_at,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMessages(conversationId: string) {
  if (!supabase || !conversationId) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,role,content,created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateConversationTitle(conversationId: string, title: string) {
  if (!supabase || !conversationId) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { error } = await supabase
    .from("conversations")
    .update({ title: cleanTitle(title), updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function updateSettings(patch: Record<string, unknown>) {
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, ...patch, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getSettings() {
  if (!supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
