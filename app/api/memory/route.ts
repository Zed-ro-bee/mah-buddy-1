import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function clientFor(token: string) {
  if (!url || !key) throw new Error("Supabase is not configured.");
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}
async function userClient(request: Request) {
  const token = bearer(request);
  if (!token) return null;
  const client = clientFor(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}
function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const auth = await userClient(request);
    if (!auth) return fail("Please sign in to access your saved memory.", 401);
    const { data, error } = await auth.client.from("user_memories")
      .select("id,content,category,updated_at")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(40);
    if (error) return fail("Saved memory is temporarily unavailable.", 503);
    return NextResponse.json({ memories: data || [] });
  } catch {
    return fail("Saved memory is temporarily unavailable.", 503);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await userClient(request);
    if (!auth) return fail("Please sign in to save memory.", 401);
    const body = await request.json();
    const action = body?.action;
    if (action === "clear") {
      const { error } = await auth.client.from("user_memories").delete().eq("user_id", auth.user.id);
      if (error) return fail("Could not clear saved memory.", 503);
      return NextResponse.json({ success: true });
    }
    if (action !== "extract") return fail("Unsupported memory action.");
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const transcript = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10).map((m: any) => `${m.role}: ${m.content.slice(0, 1200)}`).join("\n");
    if (!transcript.trim() || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) return NextResponse.json({ saved: 0 });
    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system: `Extract useful, durable, user-specific learning memories from this conversation. Return ONLY a valid JSON array of objects with keys content and category. Categories must be one of profile, learning, preference, goal. Keep each memory concise, factual, and actionable. Prioritize the user's stated learning goals, subjects and level, preferred explanation style, recurring misconceptions or topics they explicitly say are difficult, demonstrated learning progress when clear, and a specific next revision topic when the conversation establishes one. Record evidence, not assumptions: do not label a topic as mastered or weak based on one ambiguous message. Prefer updating a stable learning summary over storing repeated details. Never save sensitive personal data, health details, political/religious/sexual information, passwords, secrets, or temporary one-off details. Do not save assistant guesses or claim that a follow-up notification was sent. Maximum 5 memories per extraction. If there is nothing useful, return [].`,
      prompt: transcript,
      temperature: 0,
      maxOutputTokens: 500,
    });
    let items: any[] = [];
    try {
      const raw = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch { return NextResponse.json({ saved: 0 }); }
    let saved = 0;
    for (const item of items.slice(0, 5)) {
      const text = typeof item?.content === "string" ? item.content.trim().slice(0, 300) : "";
      const category = ["profile", "learning", "preference", "goal"].includes(item?.category) ? item.category : "learning";
      if (!text || text.length < 8) continue;
      const { data: existing } = await auth.client.from("user_memories").select("id")
        .eq("user_id", auth.user.id).eq("content", text).maybeSingle();
      if (existing?.id) {
        await auth.client.from("user_memories").update({ category, updated_at: new Date().toISOString() }).eq("id", existing.id).eq("user_id", auth.user.id);
      } else {
        const { error } = await auth.client.from("user_memories").insert({ user_id: auth.user.id, content: text, category });
        if (!error) saved++;
      }
    }
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Mah Buddy memory error:", error);
    return fail("Could not update saved memory.", 500);
  }
}

export async function DELETE(request: Request) {
  return POST(new Request(request.url, { method: "POST", headers: request.headers, body: JSON.stringify({ action: "clear" }) }));
}
