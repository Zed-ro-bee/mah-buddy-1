import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type Attachment = { name?: string; type?: string; data?: string };
type InputMessage = { role: "user" | "assistant"; content: string; attachment?: Attachment };

function imageData(data: string) {
  const match = data.match(/^data:([^;]+);base64,(.+)$/s);
  return match ? { mediaType: match[1], data: match[2] } : null;
}

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

    const normalized = messages
      .filter(
        (message: any) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .slice(-30) as InputMessage[];

    const modelMessages = normalized.map((message) => {
      const attachment = message.attachment;
      if (!attachment?.data) {
        return { role: message.role, content: message.content.slice(0, 12000) };
      }

      const type = attachment.type || "application/octet-stream";
      const name = attachment.name || "attached file";

      if (type.startsWith("image/")) {
        const image = imageData(attachment.data);
        if (image) {
          return {
            role: message.role,
            content: [
              { type: "text" as const, text: `${message.content.slice(0, 12000)}\n\nAttached image: ${name}. Analyze the image as part of the user's request.` },
              { type: "file" as const, data: image.data, mediaType: image.mediaType },
            ],
          };
        }
      }

      if (["text/plain", "text/markdown", "text/csv", "application/json", "text/html"].includes(type)) {
        return {
          role: message.role,
          content: `${message.content.slice(0, 12000)}\n\nAttached file: ${name}\n\nFile contents:\n${attachment.data.slice(0, 50000)}`,
        };
      }

      return {
        role: message.role,
        content: `${message.content.slice(0, 12000)}\n\nThe user attached a file named "${name}" (${type}), but this file type could not be extracted by the current browser attachment reader. Tell the user that this file type is not yet supported for content analysis and ask them to attach an image or text-based file instead.`,
      };
    });

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system:
        "You are Mah Buddy, a friendly AI study companion. Be clear, encouraging, age-appropriate, and concise. Explain difficult school topics step by step, use simple examples, help the student understand rather than simply completing assessed work, and follow the requested study mode. If the student asks for a quiz, ask one question at a time and wait for the answer. When an image is attached, inspect it carefully and use its visible information to answer the user's request.",
      messages: modelMessages as any,
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
