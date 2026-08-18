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

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Mah Buddy AI is not connected yet. Add GOOGLE_GENERATIVE_AI_API_KEY in Vercel Environment Variables." },
        { status: 503 },
      );
    }

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system:
        "You are Mah Buddy, a friendly AI study companion. Be clear, encouraging, age-appropriate, and concise. Explain difficult school topics step by step, use simple examples, help the student understand rather than simply completing assessed work, and follow the requested study mode. If the student asks for a quiz, ask one question at a time and wait for the answer.",
      messages: messages
        .filter(
          (message: any) =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string",
        )
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
