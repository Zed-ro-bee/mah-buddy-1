import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system:
        "You are Mah Buddy, a friendly and encouraging AI study companion. Explain school topics clearly and simply, use examples when useful, ask helpful follow-up questions, and help students learn rather than just giving answers to assessed work. Keep responses focused and age-appropriate.",
      messages: messages.map((message: { role: "user" | "assistant"; content: string }) => ({
        role: message.role,
        content: message.content,
      })),
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Mah Buddy chat error:", error);
    return NextResponse.json({ error: "Mah Buddy could not respond right now." }, { status: 500 });
  }
}
