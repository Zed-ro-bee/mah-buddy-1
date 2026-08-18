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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Mah Buddy's AI key is not configured yet. Add ANTHROPIC_API_KEY in the deployment environment." },
        { status: 503 },
      );
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system:
        "You are Mah Buddy, a friendly and encouraging AI study companion. Explain school topics clearly and simply, use examples when useful, ask helpful follow-up questions, quiz the student when requested, create useful flashcards when requested, and help students learn rather than just giving answers to assessed work. Keep responses focused, age-appropriate, and encouraging.",
      messages: messages
        .filter((message: any) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
        .slice(-30)
        .map((message: { role: "user" | "assistant"; content: string }) => ({
          role: message.role,
          content: message.content.slice(0, 12000),
        })),
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Mah Buddy chat error:", error);
    return NextResponse.json({ error: "Mah Buddy could not respond right now. Please try again." }, { status: 500 });
  }
}
