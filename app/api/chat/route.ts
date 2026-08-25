import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

type Attachment = { name?: string; type?: string; data?: string };
type InputMessage = { role: "user" | "assistant"; content: string; attachment?: Attachment };
type Profile = { preferredName?: string; buddyName?: string; age?: string; learningLevel?: string; goal?: string; educationLevel?: string };

const MAX_ATTACHMENT_CHARS = 8_500_000;
const MAX_TEXT_CHARS = 35_000;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_HISTORY_MESSAGES = 10;

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
  Easy: "Easy: basic recall and understanding, straightforward wording, familiar examples, and no unnecessary tricks.",
  Medium: "Medium: understanding and application, some reasoning, plausible alternatives, and moderate multi-step thinking.",
  Hard: "Hard: deeper reasoning, application, analysis, challenging distinctions, and academically meaningful challenge.",
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

    const normalized = messages.filter((message: any) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string").slice(-MAX_HISTORY_MESSAGES) as InputMessage[];
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
    const difficulty = ["Easy", "Medium", "Hard"].includes(requestedDifficulty) ? requestedDifficulty : "Medium";
    const profileParts = [profileName ? `Preferred user name: ${profileName}` : "", buddyName ? `User's chosen name for you: ${buddyName}` : "", profile.age ? `User age: ${String(profile.age).slice(0, 3)}` : "", level ? `Standard learning/language level: ${level} — ${levelGuide}` : "", profile.educationLevel ? `Current studies: ${String(profile.educationLevel).slice(0, 120)}` : "", profile.goal ? `Learning goal: ${String(profile.goal).slice(0, 160)}` : ""].filter(Boolean).join("\n");

    const systemParts = [`You are Mah Buddy, a smart, friendly, helpful AI companion and study assistant.\n${MAH_BUDDY_IDENTITY}\nRESPONSE BEHAVIOUR:\n- Adapt every answer to the user's saved learning level. It controls vocabulary, assumed knowledge, explanation depth, examples, and sentence complexity.\n- Difficulty is separate from learning level: Easy/Medium/Hard controls challenge and reasoning for quizzes and practice.\n- Do not force every response into the same template. Answer naturally and efficiently.\n- Keep simple questions concise; give enough depth for complex questions.\n- Respond quickly: avoid unnecessary preambles, repetition, and filler.\n- Never invent facts. Be friendly, natural, encouraging, age-appropriate, and respectful.\n\nACADEMIC RULES:\n- Give the direct answer first when appropriate, then explanation or working.\n- For calculations, show result and working. For definitions, define first and give an example when useful.\n\nQUIZ AND PRACTICE RULES — IMPORTANT:\n- When the user asks for quiz/practice questions, give ONE question at a time and wait for the user's answer.\n- Never provide the question and its answer together unless the user explicitly asks for the answer.\n- After the user answers, mark/explain that answer briefly, then give a NEW question.\n- Every new question must vary its wording, example, concept, or question type. Never repeat a previous question from the conversation.\n- Never reveal the answer to a new question before the user attempts it.\n- Keep the selected difficulty consistent while adapting language to the user's learning level.\n- If the user asks for multiple questions at once, explain that practice mode presents them one at a time so each answer can be checked before the next question.\n\nATTACHMENTS:\n- Inspect supported attachments and use their actual contents. Never pretend to have read an unsupported attachment.`];
    if (profileParts) systemParts.push(`\nREMEMBERED USER PROFILE:\n${profileParts}`);
    systemParts.push(`\nACTIVE QUESTION DIFFICULTY: ${difficulty}\n${DIFFICULTY_GUIDE[difficulty]}`);
    if (customInstructions) systemParts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${customInstructions.slice(0, 2000)}`);
    if (memory) systemParts.push(`\nRECENT CONTEXT:\n${memory.slice(0, 2500)}`);

    const result = await generateText({
      model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
      system: systemParts.join("\n"),
      messages: modelMessages as any,
      maxOutputTokens: 600,
      temperature: 0.25,
    });
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Mah Buddy chat error:", error);
    const details = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: "Mah Buddy could not respond right now.", details: details.slice(0, 500) }, { status: 500 });
  }
}
