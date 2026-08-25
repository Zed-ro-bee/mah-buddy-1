import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const LEVELS: Record<string, string> = {
  Foundation: "Use very simple English, basic concepts, and clear everyday examples.",
  Developing: "Use clear English, moderate concepts, and practical application.",
  Proficient: "Use fluent English, subject terminology, and reasoning-based questions.",
  Advanced: "Use precise academic language and deeper analysis.",
  Expert: "Use sophisticated language, advanced concepts, and rigorous reasoning.",
};
const DIFFICULTIES: Record<string, string> = {
  Easy: "basic recall and simple understanding",
  Medium: "understanding, application, and moderate reasoning",
  Hard: "analysis, multi-step reasoning, and challenging distinctions",
};

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("["); const end = candidate.lastIndexOf("]");
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = String(body.topic || "General study").slice(0, 180);
    const difficulty = ["Easy", "Medium", "Hard"].includes(body.difficulty) ? body.difficulty : "Medium";
    const learningLevel = LEVELS[body.learningLevel] ? body.learningLevel : "Developing";
    const count = Math.max(1, Math.min(100, Number(body.count) || 10));
    const previous = Array.isArray(body.previousQuestions) ? body.previousQuestions.slice(-80).map(String) : [];

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return NextResponse.json({ error: "Mah Buddy AI is not connected yet." }, { status: 503 });

    const prompt = `Create ${count} DIFFERENT multiple-choice questions about: ${topic}.
Difficulty: ${difficulty} — ${DIFFICULTIES[difficulty]}.
Learning/language level: ${learningLevel} — ${LEVELS[learningLevel]}.
Never repeat or paraphrase any previous question listed below.
Previous questions: ${previous.length ? JSON.stringify(previous) : "none"}
Return ONLY valid JSON, with no markdown, in this exact shape:
[{"q":"question","a":["option A","option B","option C","option D"],"c":0}]
Rules: exactly four options; c is the zero-based index of the correct option; one unambiguous correct answer; questions must test different concepts or angles; do not reveal answers in the question; keep wording appropriate for the selected learning level.`;

    const result = await generateText({ model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"), prompt });
    const questions = cleanJson(result.text);
    if (!Array.isArray(questions) || !questions.length) throw new Error("No quiz questions were generated.");

    const valid = questions.filter((x: any) => x && typeof x.q === "string" && Array.isArray(x.a) && x.a.length === 4 && Number.isInteger(x.c) && x.c >= 0 && x.c < 4).map((x: any) => ({ q: x.q, a: x.a.map(String), c: x.c }));
    if (!valid.length) throw new Error("Generated quiz questions were invalid.");
    return NextResponse.json({ questions: valid.slice(0, count) });
  } catch (error) {
    console.error("Mah Buddy quiz error:", error);
    return NextResponse.json({ error: "Mah Buddy could not create the quiz right now." }, { status: 500 });
  }
}
