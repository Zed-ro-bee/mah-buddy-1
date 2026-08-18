import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Mah Buddy's Gemini key is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY in the deployment environment." },
        { status: 503 },
      );
    }

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
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
    const details = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Mah Buddy could not respond right now.", details: details.slice(0, 500) },
      { status: 500 },
    );
  }
}
