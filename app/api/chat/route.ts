import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type Attachment = { name?: string; type?: string; data?: string };
type InputMessage = { role: "user" | "assistant"; content: string; attachment?: Attachment };

const MAX_ATTACHMENT_CHARS = 8_500_000;
const MAX_TEXT_CHARS = 50_000;
const MAX_MESSAGE_CHARS = 12_000;

function imageData(data: string) {
  const match = data.match(/^data:([^;]+);base64,(.+)$/s);
  return match ? { mediaType: match[1], data: match[2] } : null;
}

function fileData(data: string, fallbackType: string) {
  const match = data.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) return { mediaType: match[1] || fallbackType, data: match[2] };

  // Accept a raw base64 payload too. This makes the API more tolerant of
  // clients that omit the data:...;base64, prefix.
  if (/^[A-Za-z0-9+/\s]+={0,2}$/.test(data) && data.replace(/\s/g, "").length > 32) {
    return { mediaType: fallbackType, data: data.replace(/\s/g, "") };
  }
  return null;
}

function attachmentError(name: string, type: string) {
  return `The attached file "${name}" (${type}) could not be transferred safely. Please attach it again or use a supported format.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const customInstructions = typeof body.customInstructions === "string" ? body.customInstructions.trim() : "";
    const memory = typeof body.memory === "string" ? body.memory.trim() : "";

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
        return { role: message.role, content: message.content.slice(0, MAX_MESSAGE_CHARS) };
      }

      const type = attachment.type || "application/octet-stream";
      const name = attachment.name || "attached file";
      const rawData = attachment.data;

      if (rawData.length > MAX_ATTACHMENT_CHARS) {
        return {
          role: message.role,
          content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe attachment "${name}" is too large to process. Please choose a smaller file.`
        };
      }

      if (type.startsWith("image/")) {
        const image = imageData(rawData);
        if (image) {
          return {
            role: message.role,
            content: [
              { type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached image: ${name}. Analyze the image as part of the user's request.` },
              { type: "file" as const, data: image.data, mediaType: image.mediaType },
            ],
          };
        }
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` };
      }

      // Binary attachments must arrive as a data URL or raw base64. The
      // browser should never send binary files through File.text().
      if (type === "application/pdf" || type.startsWith("audio/") || type.startsWith("video/")) {
        const file = fileData(rawData, type);
        if (file) {
          return {
            role: message.role,
            content: [
              { type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}. Analyze this file as part of the user's request.` },
              { type: "file" as const, data: file.data, mediaType: file.mediaType },
            ],
          };
        }
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` };
      }

      if (["text/plain", "text/markdown", "text/csv", "application/json", "text/html"].includes(type)) {
        return {
          role: message.role,
          content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}\n\nFile contents:\n${rawData.slice(0, MAX_TEXT_CHARS)}`,
        };
      }

      return {
        role: message.role,
        content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe user attached a file named "${name}" (${type}), but this file type is not currently supported for content analysis. Tell the user which supported format to use instead.`,
      };
    });

    const systemParts = [
      `You are Mah Buddy, a smart, friendly, helpful AI companion and study assistant.

CORE BEHAVIOR:
- Understand what kind of question the user is asking before deciding how to answer.
- Do not use one fixed response format for every question.
- Answer naturally, clearly, accurately, and directly.
- Be concise for simple questions and provide more detail when the question requires it.
- Never hide the actual answer underneath a long introduction.
- If you are unsure about something, say so instead of making up information.
- Be friendly, encouraging, age-appropriate, and respectful.

ACADEMIC AND SCHOOL QUESTIONS:
- When the user asks an academic or school-subject question, give the direct answer FIRST.
- After the answer, explain the concept clearly and step by step when useful.
- For calculations, give the final answer first, then show the working.
- For definitions, give the definition first, then explain it and give a simple example when useful.
- For yes/no academic questions, answer Yes or No first, then explain why.
- Use simple language unless the user asks for an advanced explanation.
- Help the student understand the topic rather than simply completing assessed work for them.

GENERAL QUESTIONS:
- For everyday, conversational, technical, creative, or general-knowledge questions, answer naturally according to the user's request.
- Do not automatically use the academic Answer/Explanation format unless the question is actually academic.

QUIZZES:
- If the student asks for a quiz, ask one question at a time and wait for the answer before continuing.

ATTACHMENTS:
- When an image is attached, inspect it carefully and use its visible information to answer the user's request.
- When a supported text file is attached, use its contents when answering.
- When a PDF or other supported binary file is attached, inspect the file itself rather than pretending it is plain text.
- If an attachment cannot be analyzed, clearly explain the limitation and suggest a supported format.`,
    ];

    if (customInstructions) {
      systemParts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${customInstructions.slice(0, 4000)}`);
    }

    if (memory) {
      systemParts.push(`\nRECENT USER CONTEXT:\n${memory.slice(0, 4000)}`);
    }

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system: systemParts.join("\n"),
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
