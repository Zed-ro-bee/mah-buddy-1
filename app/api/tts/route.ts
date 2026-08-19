import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice is not connected yet. Add OPENAI_API_KEY to Vercel Environment Variables." },
        { status: 503 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "marin",
        input: text.slice(0, 4096),
        instructions: "Speak naturally, warmly, clearly, and conversationally. You are Mah Buddy, a friendly AI study companion. Use a calm, encouraging tone and moderate pace.",
        response_format: "mp3",
        speed: 0.98,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Mah Buddy TTS error:", details);
      return NextResponse.json({ error: "Mah Buddy could not generate the voice right now." }, { status: response.status });
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Mah Buddy TTS error:", error);
    return NextResponse.json({ error: "Mah Buddy could not generate the voice right now." }, { status: 500 });
  }
}
