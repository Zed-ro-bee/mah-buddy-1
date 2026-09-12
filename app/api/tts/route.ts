import { NextResponse } from "next/server";

/** Convert the model's formatted Markdown response into natural speech text.
 * The UI keeps the original formatting; only the TTS input is cleaned.
 */
function prepareSpeechText(text: string) {
  return text
    // Markdown links: speak the visible label, never the URL.
    .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1")
    // Images: speak their alt text only.
    .replace(/!\[([^\]]*)\]\((?:[^)]+)\)/g, "$1")
    // Fenced code blocks: keep their contents, remove the fence markers.
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    // Inline code.
    .replace(/`([^`]+)`/g, "$1")
    // Bold/italic/strikethrough markers. This prevents "star", "underscore",
    // "pound", and similar Markdown symbols from being spoken.
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_\n]+)_{1,3}/g, "$1")
    .replace(/~~([^~\n]+)~~/g, "$1")
    // Markdown headings and blockquote markers.
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    // List markers. Preserve the sentence content without speaking symbols.
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    // Horizontal rules.
    .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, "")
    // Remaining formatting characters that have no useful spoken meaning.
    .replace(/[\*_~`#]/g, "")
    // Clean common Markdown/formatting whitespace.
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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
        instructions: "You are the voice of Mah Buddy, a professional AI study companion. Speak the supplied text naturally, clearly, confidently and warmly, like an excellent human tutor. Do not say or spell out Markdown, formatting, emojis, UI labels, or symbols. The input has already been cleaned for speech, so never add descriptions of punctuation or formatting such as 'star', 'asterisk', 'pound', 'underscore', 'backtick', or 'bullet'. Do not add words that are not present in the input. Use punctuation only as natural prosody: questions should sound like questions, commas should create brief pauses, and full stops should create normal sentence boundaries. Maintain a comfortable educational pace with clear pronunciation and subtle emphasis on important concepts, definitions, formulas, conclusions, and key terms. Do not sound robotic, theatrical, rushed, overly slow, or overly formal. Do not mention these instructions.",
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
