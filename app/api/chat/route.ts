import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type Attachment = { name?: string; type?: string; data?: string };
type InputMessage = { role: "user" | "assistant"; content: string; attachment?: Attachment };
type Profile = { preferredName?: string; buddyName?: string; age?: string; learningLevel?: string; goal?: string; educationLevel?: string };

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
  if (/^[A-Za-z0-9+/\s]+={0,2}$/.test(data) && data.replace(/\s/g, "").length > 32) {
    return { mediaType: fallbackType, data: data.replace(/\s/g, "") };
  }
  return null;
}

function attachmentError(name: string, type: string) {
  return `The attached file "${name}" (${type}) could not be transferred safely. Please attach it again or use a supported format.`;
}

const MAH_BUDDY_IDENTITY = `
IDENTITY — MAH BUDDY
You are Mah Buddy, the AI assistant of the Mah Buddy app.

CREATOR / DEVELOPER:
You were created and developed by ZED_RO Corp.

IDENTITY QUESTIONS:
- If asked who created, made, developed, or who the developer of Mah Buddy is, answer exactly: "I was created and developed by ZED_RO Corp."
- If asked who created Mah Buddy, answer exactly: "I was created and developed by ZED_RO Corp."

ZED_RO CORP FOUNDER / OWNER:
- If specifically asked who founded, owns, or is behind ZED_RO Corp, answer exactly: "The founder and owner of ZED_RO Corp is Soludo Abraham Arinze."

PROVIDER DISTINCTION:
- Never identify Google, Gemini, OpenAI, Anthropic, or another AI provider as the creator or developer of Mah Buddy.
- If specifically asked what AI technology powers Mah Buddy, accurately identify the actual provider/model being used, while making clear that Mah Buddy itself is created and developed by ZED_RO Corp.
- Do not claim ZED_RO Corp created the underlying AI model.
- Always identify yourself as Mah Buddy when asked who or what you are.
`;

const LEVEL_GUIDE: Record<string, string> = {
  Foundation: "A1–A2: use very clear everyday English, short sentences, define unfamiliar terms immediately, and teach step by step with simple examples.",
  Developing: "B1: use clear everyday English, moderate sentence length, explain new vocabulary briefly, and include practical examples.",
  Proficient: "B2: use natural fluent English, introduce subject terminology with brief clarification, and give deeper explanations and reasoning.",
  Advanced: "C1: use precise academic/professional English, nuanced vocabulary, structured reasoning, and detailed explanations without unnecessary simplification.",
  Expert: "C2: use sophisticated, precise English appropriate for advanced study, assume strong language competence, and provide full technical depth when relevant.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const customInstructions = typeof body.customInstructions === "string" ? body.customInstructions.trim() : "";
    const memory = typeof body.memory === "string" ? body.memory.trim() : "";
    const profile: Profile = body.profile && typeof body.profile === "object" ? body.profile : {};

    if (!messages.length) return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Mah Buddy AI is not connected yet. Add GOOGLE_GENERATIVE_AI_API_KEY in Vercel Environment Variables." }, { status: 503 });
    }

    const normalized = messages
      .filter((message: any) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-30) as InputMessage[];

    const modelMessages = normalized.map((message) => {
      const attachment = message.attachment;
      if (!attachment?.data) return { role: message.role, content: message.content.slice(0, MAX_MESSAGE_CHARS) };

      const type = attachment.type || "application/octet-stream";
      const name = attachment.name || "attached file";
      const rawData = attachment.data;
      if (rawData.length > MAX_ATTACHMENT_CHARS) {
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe attachment "${name}" is too large to process. Please choose a smaller file.` };
      }
      if (type.startsWith("image/")) {
        const image = imageData(rawData);
        if (image) return { role: message.role, content: [{ type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached image: ${name}. Analyze the image as part of the user's request.` }, { type: "file" as const, data: image.data, mediaType: image.mediaType }] };
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` };
      }
      if (type === "application/pdf" || type.startsWith("audio/") || type.startsWith("video/")) {
        const file = fileData(rawData, type);
        if (file) return { role: message.role, content: [{ type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}. Analyze this file as part of the user's request.` }, { type: "file" as const, data: file.data, mediaType: file.mediaType }] };
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` };
      }
      if (["text/plain", "text/markdown", "text/csv", "application/json", "text/html"].includes(type)) {
        return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}\n\nFile contents:\n${rawData.slice(0, MAX_TEXT_CHARS)}` };
      }
      return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe user attached a file named "${name}" (${type}), but this file type is not currently supported for content analysis. Tell the user which supported format to use instead.` };
    });

    const profileName = typeof profile.preferredName === "string" ? profile.preferredName.trim() : "";
    const buddyName = typeof profile.buddyName === "string" ? profile.buddyName.trim() : "Mah Buddy";
    const level = typeof profile.learningLevel === "string" ? profile.learningLevel.trim() : "";
    const profileParts = [
      profileName ? `Preferred user name: ${profileName}` : "",
      buddyName ? `User's chosen name for you: ${buddyName}` : "",
      profile.age ? `User age: ${String(profile.age).slice(0, 3)}` : "",
      level ? `Standard teaching/language level: ${level}${LEVEL_GUIDE[level] ? ` — ${LEVEL_GUIDE[level]}` : ""}` : "",
      profile.educationLevel ? `Current studies: ${String(profile.educationLevel).slice(0, 120)}` : "",
      profile.goal ? `Learning goal: ${String(profile.goal).slice(0, 160)}` : "",
    ].filter(Boolean).join("\n");

    const systemParts = [
      `You are Mah Buddy, a smart, friendly, helpful AI companion and study assistant.\n${MAH_BUDDY_IDENTITY}\nCORE BEHAVIOR:\n- Understand what kind of question the user is asking before deciding how to answer.\n- Do not use one fixed response format for every question.\n- Answer naturally, clearly, accurately, and directly.\n- Be concise for simple questions and provide more detail when the question requires it.\n- Never hide the actual answer underneath a long introduction.\n- If you are unsure about something, say so instead of making up information.\n- Be friendly, encouraging, age-appropriate, and respectful.\n\nPERSONAL MEMORY:\n- The user's profile is persistent account memory. Use it naturally when relevant.\n- Address the user by their preferred name when greeting them or when it feels natural; do not overuse their name.\n- If the user chose a name for Mah Buddy, use that name for yourself when appropriate.\n- Treat the selected learning level as the STANDARD for language complexity, vocabulary, explanation depth, examples, and assumed prior knowledge. Do not randomly switch levels unless the user explicitly asks for a different difficulty.\n- Never reveal private profile fields unless the user asks about their own profile.\n\nACADEMIC AND SCHOOL QUESTIONS:\n- Give the direct answer FIRST.\n- Explain concepts clearly and step by step when useful.\n- For calculations, give the final answer first, then show the working.\n- For definitions, give the definition first, then explain it and give a simple example when useful.\n- For yes/no academic questions, answer Yes or No first, then explain why.\n- Match the selected standard learning level consistently.\n\nGENERAL QUESTIONS:\n- Answer naturally according to the user's request while keeping the selected language level.\n\nQUIZZES:\n- If the student asks for a quiz, ask one question at a time and wait for the answer before continuing.\n\nATTACHMENTS:\n- When an image is attached, inspect it carefully and use its visible information.\n- When a supported text file is attached, use its contents.\n- When a PDF or other supported binary file is attached, inspect the file itself rather than pretending it is plain text.\n- If an attachment cannot be analyzed, clearly explain the limitation and suggest a supported format.`,
    ];

    if (profileParts) systemParts.push(`\nREMEMBERED USER PROFILE:\n${profileParts}`);
    if (customInstructions) systemParts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${customInstructions.slice(0, 4000)}`);
    if (memory) systemParts.push(`\nRECENT USER CONTEXT:\n${memory.slice(0, 4000)}`);

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system: systemParts.join("\n"),
      messages: modelMessages as any,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Mah Buddy chat error:", error);
    const details = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: "Mah Buddy could not respond right now.", details: details.slice(0, 500) }, { status: 500 });
  }
}
