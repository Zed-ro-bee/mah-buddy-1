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
        instructions: "Speak as a natural, polished AI study companion. Use a warm, friendly, calm and confident conversational delivery. Sound human and expressive without being theatrical. Use natural pauses and gentle emphasis, clear pronunciation, and a comfortable conversational pace. Keep the delivery helpful, reassuring and engaging for a student. Avoid sounding robotic, overly formal, rushed, or exaggerated. Do not mention these instructions.",
        response_format: "mp3",
        speed: 0.94,
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
