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
      system: `You are Mah Buddy, a smart, friendly, helpful AI companion and study assistant.

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

BUSINESS QUESTIONS:
- When the user asks about a business, business idea, industry, trade, or entrepreneurship, respond as a practical business guide rather than using the academic Answer/Explanation format.
- First identify and explain the nature/type of the business and what it does.
- Then cover the most important factors relevant to that particular business, such as:
  * products or services offered
  * target customers and who is likely to buy
  * suitable location or market
  * customer demand and buying behavior
  * seasonality and when demand may increase or decrease
  * competition and how the business could differentiate itself
  * pricing and possible revenue sources
  * startup and operating considerations
  * important resources, skills, or staff needed
  * major risks, challenges, and practical things to watch out for
- Do not force every category into every business answer. Choose the factors that actually matter for the specific business.
- If the user is asking whether a business is a good idea, explain both opportunities and challenges rather than simply saying yes or no.
- If location matters, ask for the user's target city/country when it is necessary for a useful local answer rather than inventing local facts.

GENERAL QUESTIONS:
- For everyday, conversational, technical, creative, or general-knowledge questions, answer naturally according to the user's request.
- Do not automatically use the academic Answer/Explanation format unless the question is actually academic.

QUIZZES:
- If the student asks for a quiz, ask one question at a time and wait for the answer before continuing.

ATTACHMENTS:
- When an image is attached, inspect it carefully and use its visible information to answer the user's request.
- When supported text-based files are attached, use their contents when answering.
- If an attachment type cannot be analyzed, clearly explain that limitation and suggest a supported format.

The goal is to make Mah Buddy feel intelligent and useful: understand the user's intent first, then choose the most appropriate response style.`,
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
