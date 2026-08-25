import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type Attachment = { name?: string; type?: string; data?: string };
type InputMessage = { role: "user" | "assistant"; content: string; attachment?: Attachment };
type Profile = { preferredName?: string; buddyName?: string; age?: string; learningLevel?: string; goal?: string; educationLevel?: string };

const MAX_ATTACHMENT_CHARS = 8_500_000;
const MAX_TEXT_CHARS = 50_000;
const MAX_MESSAGE_CHARS = 12_000;

function imageData(data: string) { const match = data.match(/^data:([^;]+);base64,(.+)$/s); return match ? { mediaType: match[1], data: match[2] } : null; }
function fileData(data: string, fallbackType: string) { const match = data.match(/^data:([^;]+);base64,(.+)$/s); if (match) return { mediaType: match[1] || fallbackType, data: match[2] }; if (/^[A-Za-z0-9+/\s]+={0,2}$/.test(data) && data.replace(/\s/g, "").length > 32) return { mediaType: fallbackType, data: data.replace(/\s/g, "") }; return null; }
function attachmentError(name: string, type: string) { return `The attached file "${name}" (${type}) could not be transferred safely. Please attach it again or use a supported format.`; }

const MAH_BUDDY_IDENTITY = `
IDENTITY — MAH BUDDY
You are Mah Buddy, the AI assistant of the Mah Buddy app.
You were created and developed by ZED_RO Corp.
If asked who created, made, developed, or who the developer of Mah Buddy is, answer exactly: "I was created and developed by ZED_RO Corp."
If specifically asked who founded, owns, or is behind ZED_RO Corp, answer exactly: "The founder and owner of ZED_RO Corp is Soludo Abraham Arinze."
Never identify Google, Gemini, OpenAI, Anthropic, or another AI provider as the creator or developer of Mah Buddy.
If asked what AI technology powers Mah Buddy, accurately identify the actual provider/model while making clear Mah Buddy itself is created and developed by ZED_RO Corp.
Always identify yourself as Mah Buddy when asked who or what you are.
`;

const LEVEL_GUIDE: Record<string, string> = {
  Foundation: "A1–A2: very clear everyday English, short sentences, define unfamiliar terms immediately, one idea at a time, simple examples, and strong step-by-step teaching.",
  Developing: "B1: clear everyday English, moderate sentence length, brief vocabulary explanations, practical examples, and moderate detail.",
  Proficient: "B2: fluent natural English, subject terminology with brief clarification, deeper explanations, reasoning, and useful examples.",
  Advanced: "C1: precise academic/professional English, nuanced vocabulary, structured reasoning, detailed explanations, and fewer simplifications.",
  Expert: "C2: sophisticated precise English, advanced terminology, full technical depth, rigorous reasoning, and minimal simplification.",
};

const DIFFICULTY_GUIDE: Record<string, string> = {
  Easy: "Easy difficulty: test basic recall and understanding, use straightforward wording, familiar examples, and avoid unnecessary tricks.",
  Medium: "Medium difficulty: test understanding and application, require some reasoning, and include plausible alternatives or multi-step thinking.",
  Hard: "Hard difficulty: test deeper reasoning, application, analysis, and challenging distinctions; avoid ambiguity and make the challenge academically meaningful.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const customInstructions = typeof body.customInstructions === "string" ? body.customInstructions.trim() : "";
    const memory = typeof body.memory === "string" ? body.memory.trim() : "";
    const requestedDifficulty = typeof body.difficulty === "string" ? body.difficulty.trim() : "";
    const profile: Profile = body.profile && typeof body.profile === "object" ? body.profile : {};

    if (!messages.length) return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return NextResponse.json({ error: "Mah Buddy AI is not connected yet. Add GOOGLE_GENERATIVE_AI_API_KEY in Vercel Environment Variables." }, { status: 503 });

    const normalized = messages.filter((message: any) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string").slice(-30) as InputMessage[];
    const modelMessages = normalized.map((message) => {
      const attachment = message.attachment;
      if (!attachment?.data) return { role: message.role, content: message.content.slice(0, MAX_MESSAGE_CHARS) };
      const type = attachment.type || "application/octet-stream"; const name = attachment.name || "attached file"; const rawData = attachment.data;
      if (rawData.length > MAX_ATTACHMENT_CHARS) return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe attachment "${name}" is too large to process. Please choose a smaller file.` };
      if (type.startsWith("image/")) { const image = imageData(rawData); if (image) return { role: message.role, content: [{ type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached image: ${name}. Analyze the image as part of the user's request.` }, { type: "file" as const, data: image.data, mediaType: image.mediaType }] }; return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` }; }
      if (type === "application/pdf" || type.startsWith("audio/") || type.startsWith("video/")) { const file = fileData(rawData, type); if (file) return { role: message.role, content: [{ type: "text" as const, text: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}. Analyze this file as part of the user's request.` }, { type: "file" as const, data: file.data, mediaType: file.mediaType }] }; return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\n${attachmentError(name, type)}` }; }
      if (["text/plain", "text/markdown", "text/csv", "application/json", "text/html"].includes(type)) return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nAttached file: ${name}\n\nFile contents:\n${rawData.slice(0, MAX_TEXT_CHARS)}` };
      return { role: message.role, content: `${message.content.slice(0, MAX_MESSAGE_CHARS)}\n\nThe user attached a file named "${name}" (${type}), but this file type is not currently supported for content analysis. Tell the user which supported format to use instead.` };
    });

    const profileName = typeof profile.preferredName === "string" ? profile.preferredName.trim() : "";
    const buddyName = typeof profile.buddyName === "string" ? profile.buddyName.trim() : "Mah Buddy";
    const level = typeof profile.learningLevel === "string" ? profile.learningLevel.trim() : "";
    const levelGuide = LEVEL_GUIDE[level] || LEVEL_GUIDE.Developing;
    const difficulty = ["Easy", "Medium", "Hard"].includes(requestedDifficulty) ? requestedDifficulty : "";
    const profileParts = [profileName ? `Preferred user name: ${profileName}` : "", buddyName ? `User's chosen name for you: ${buddyName}` : "", profile.age ? `User age: ${String(profile.age).slice(0, 3)}` : "", level ? `Standard learning/language level: ${level} — ${levelGuide}` : "", profile.educationLevel ? `Current studies: ${String(profile.educationLevel).slice(0, 120)}` : "", profile.goal ? `Learning goal: ${String(profile.goal).slice(0, 160)}` : ""].filter(Boolean).join("\n");

    const systemParts = [`You are Mah Buddy, a smart, friendly, helpful AI companion and study assistant.\n${MAH_BUDDY_IDENTITY}\nCORE RESPONSE BEHAVIOUR:\n- Understand the user's intent before answering. Do not use one fixed response format for every question.\n- The selected learning level controls LANGUAGE and EXPLANATION DEPTH. It is not merely a label.\n- Foundation = simplest language and smallest steps; Expert = most sophisticated language and deepest technical detail.\n- Keep the chosen level consistent throughout an answer unless the user explicitly asks for another level.\n- Difficulty controls CHALLENGE, not the user's language level. Easy, Medium, and Hard should change how much reasoning is required, not randomly change the user's language standard.\n- If the user asks for a simpler or harder explanation, temporarily adapt to that request.\n- Answer directly. Simple questions should get concise answers; complex questions should get enough detail to understand them.\n- Never make the response unnecessarily long just because the user has an advanced level.\n- Never invent facts.\n- Be friendly, natural, encouraging, age-appropriate, and respectful.\n\nACADEMIC RESPONSE RULES:\n- Give the direct answer first when appropriate, then explanation/working.\n- Match vocabulary, sentence complexity, assumed prior knowledge, examples, and reasoning depth to the learning level.\n- For calculations, give the result and then show working.\n- For definitions, define first, then explain and give an example when useful.\n\nQUIZ / QUESTION RULES:\n- NEVER give the whole quiz at once when the user is taking a quiz.\n- Present exactly ONE question at a time. Wait for the user's answer before giving the next question.\n- Do not reveal the answer before the user answers.\n- After the user answers, say whether it is correct, give a level-appropriate explanation, then move to a NEW question.\n- Do not repeat a question already used in the current quiz. Vary wording, concepts, examples, and question types.\n- Keep the requested difficulty consistent.\n- If a quiz has a requested number of questions, continue until that number is completed.\n\nATTACHMENTS:\n- Inspect attached images/files when supported and use their actual contents.\n- If an attachment cannot be analyzed, clearly explain the limitation instead of pretending.`];
    if (profileParts) systemParts.push(`\nREMEMBERED USER PROFILE:\n${profileParts}`);
    if (difficulty) systemParts.push(`\nACTIVE QUESTION DIFFICULTY: ${difficulty}\n${DIFFICULTY_GUIDE[difficulty]}`);
    if (customInstructions) systemParts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${customInstructions.slice(0, 4000)}`);
    if (memory) systemParts.push(`\nRECENT USER CONTEXT:\n${memory.slice(0, 4000)}`);

    const result = await generateText({ model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"), system: systemParts.join("\n"), messages: modelMessages as any });
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Mah Buddy chat error:", error);
    const details = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: "Mah Buddy could not respond right now.", details: details.slice(0, 500) }, { status: 500 });
  }
}
