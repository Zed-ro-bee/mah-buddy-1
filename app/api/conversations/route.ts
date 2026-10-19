import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function clientFor(token: string) {
  if (!url || !key) throw new Error("Supabase is not configured.");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authenticated(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return null;
  const client = clientFor(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}

export async function GET(request: Request) {
  try {
    const auth = await authenticated(request);
    if (!auth) return fail("Please sign in to access your chat history.", 401);

    const { data: conversations, error: conversationsError } = await auth.client
      .from("conversations")
      .select("id,title,created_at,updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (conversationsError) return fail("Chat history is temporarily unavailable.", 503);
    const ids = (conversations || []).map((item: any) => item.id);
    let messages: any[] = [];
    if (ids.length) {
      const { data, error } = await auth.client
        .from("messages")
        .select("id,conversation_id,role,content,created_at")
        .eq("user_id", auth.user.id)
        .in("conversation_id", ids)
        .order("created_at", { ascending: true });
      if (error) return fail("Chat history is temporarily unavailable.", 503);
      messages = data || [];
    }

    const byConversation = new Map<string, any[]>();
    for (const message of messages) {
      const list = byConversation.get(message.conversation_id) || [];
      if (message.role === "user" || message.role === "assistant") {
        list.push({ role: message.role, content: message.content || "" });
      }
      byConversation.set(message.conversation_id, list);
    }

    return NextResponse.json({
      history: (conversations || []).map((item: any) => ({
        id: item.id,
        title: item.title || "New conversation",
        updatedAt: new Date(item.updated_at || item.created_at).getTime(),
        messages: byConversation.get(item.id) || [],
      })),
    });
  } catch {
    return fail("Chat history is temporarily unavailable.", 503);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticated(request);
    if (!auth) return fail("Please sign in to save chat history.", 401);

    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) return fail("Invalid conversation ID.");

    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) || "New conversation" : "New conversation";
    const input = Array.isArray(body?.messages) ? body.messages.slice(-200) : [];
    const messages = input
      .filter((item: any) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .map((item: any) => ({ user_id: auth.user.id, conversation_id: id, role: item.role, content: item.content.slice(0, 12000) }));

    const { data: existingConversation, error: ownershipError } = await auth.client
      .from("conversations").select("id,user_id").eq("id", id).maybeSingle();
    if (ownershipError) return fail("Could not verify this conversation.", 503);
    if (existingConversation && existingConversation.user_id !== auth.user.id) {
      return fail("You do not have access to this conversation.", 403);
    }

    const { data: oldMessages, error: oldMessagesError } = await auth.client
      .from("messages").select("id").eq("conversation_id", id).eq("user_id", auth.user.id);
    if (oldMessagesError) return fail("Could not update this conversation.", 503);

    const now = new Date().toISOString();
    const { error: conversationError } = await auth.client.from("conversations").upsert({
      id, user_id: auth.user.id, title, updated_at: now,
    }, { onConflict: "id" });
    if (conversationError) return fail("Could not save this conversation.", 503);

    // Insert the replacement transcript before removing the old one. If insertion fails,
    // the existing conversation remains intact instead of being wiped by a failed save.
    if (messages.length) {
      const { error: insertError } = await auth.client.from("messages").insert(messages);
      if (insertError) return fail("Could not save the messages in this conversation. Your previous saved messages were kept.", 503);
    }

    const oldIds = (oldMessages || []).map((item: any) => item.id).filter(Boolean);
    if (oldIds.length) {
      const { error: deleteError } = await auth.client.from("messages")
        .delete().eq("conversation_id", id).eq("user_id", auth.user.id).in("id", oldIds);
      if (deleteError) return fail("Your new messages were saved, but old copies could not be cleaned up. Please retry saving.", 503);
    }

    return NextResponse.json({ success: true, id, updatedAt: Date.now() });
  } catch {
    return fail("Could not save chat history right now.", 503);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticated(request);
    if (!auth) return fail("Please sign in to manage your chat history.", 401);
    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "";
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) return fail("Invalid conversation ID.");

    const { data: conversation, error: lookupError } = await auth.client
      .from("conversations").select("id").eq("id", id).eq("user_id", auth.user.id).maybeSingle();
    if (lookupError) return fail("Could not verify this conversation.", 503);
    if (!conversation) return fail("Conversation not found.", 404);

    const { error: messageError } = await auth.client.from("messages")
      .delete().eq("conversation_id", id).eq("user_id", auth.user.id);
    if (messageError) return fail("Could not delete the conversation messages.", 503);
    const { error: conversationError } = await auth.client.from("conversations")
      .delete().eq("id", id).eq("user_id", auth.user.id);
    if (conversationError) return fail("Could not delete this conversation.", 503);
    return NextResponse.json({ success: true, id });
  } catch {
    return fail("Could not delete this conversation right now.", 503);
  }
}
