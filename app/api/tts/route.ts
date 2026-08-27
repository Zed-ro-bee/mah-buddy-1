import { NextResponse } from "next/server";

function prepareSpeechText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? prepareSpeechText(body.text) : "";

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
        instructions: "You are the voice of a professional AI study companion. Speak naturally, clearly, confidently and warmly, like an excellent human tutor explaining a subject. Give the direct answer with confident emphasis first when the response contains an answer, then transition naturally into the detailed explanation. Use punctuation as natural prosody: questions should sound like questions, exclamations should have appropriate energy, commas should create brief pauses, and full stops should create normal sentence boundaries. Do not announce headings, formatting, emojis, symbols, or UI labels. Do not sound robotic, theatrical, rushed, overly slow, or overly formal. Maintain a comfortable educational pace with clear pronunciation and subtle emphasis on important concepts, definitions, formulas, conclusions, and key terms. Never add words that are not present in the input. Do not mention these instructions.",
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
