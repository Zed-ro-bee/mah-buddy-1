import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const LEVELS: Record<string, string> = {
  Foundation: "A1–A2: use very simple English, basic concepts, short sentences, clear everyday examples, and step-by-step reasoning.",
  Developing: "B1: use clear English, moderate concepts, practical examples, and moderate reasoning.",
  Proficient: "B2: use fluent natural English, subject terminology with brief clarification, deeper explanations, and reasoning-based questions.",
  Advanced: "C1: use precise academic language, nuanced vocabulary, detailed reasoning, and fewer simplifications.",
  Expert: "C2: use sophisticated language, advanced concepts, rigorous reasoning, and full technical depth.",
};

const DIFFICULTIES: Record<string, string> = {
  Easy: "basic recall and simple understanding",
  Normal: "understanding, application, and moderate reasoning",
  Hard: "analysis, multi-step reasoning, challenging distinctions, and difficult application",
};

function normalizeDifficulty(value: unknown) {
  if (value === "Medium") return "Normal";
  return ["Easy", "Normal", "Hard"].includes(String(value)) ? String(value) : "Normal";
}

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("The AI did not return a valid quiz list.");
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validQuestions(items: unknown[]) {
  return items
    .filter((x: any) => x && typeof x.q === "string" && x.q.trim() && Array.isArray(x.a) && x.a.length === 4 && Number.isInteger(x.c) && x.c >= 0 && x.c < 4)
    .map((x: any) => ({ q: x.q.trim(), a: x.a.map(String), c: x.c }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = String(body.topic || "General study").slice(0, 180);
    const difficulty = normalizeDifficulty(body.difficulty);
    const learningLevel = LEVELS[body.learningLevel] ? String(body.learningLevel) : "Developing";
    const count = Math.max(1, Math.min(100, Number(body.count) || 10));
    const previous = Array.isArray(body.previousQuestions) ? body.previousQuestions.slice(-100).map(String) : [];

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return NextResponse.json({ error: "Mah Buddy AI is not connected yet." }, { status: 503 });

    const questions: {q:string;a:string[];c:number}[] = [];
    const seen = new Set(previous.map(normalizeQuestion));
    let attempts = 0;

    while (questions.length < count && attempts < 3) {
      attempts += 1;
      const remaining = count - questions.length;
      const outputTokens = Math.min(14000, Math.max(1800, remaining * 95));
      const prompt = `Create exactly ${remaining} DIFFERENT multiple-choice questions about: ${topic}.
Difficulty: ${difficulty} — ${DIFFICULTIES[difficulty]}.
Learning/language level: ${learningLevel} — ${LEVELS[learningLevel]}.
The question wording, vocabulary, assumed knowledge, and reasoning depth must match the learning level. Difficulty must change the intellectual challenge, not merely the wording.
Do not repeat or paraphrase any excluded question.
Excluded questions: ${JSON.stringify([...seen].slice(-100))}
Return ONLY valid JSON, with no markdown, exactly in this shape:
[{"q":"question","a":["option A","option B","option C","option D"],"c":0}]
Rules: exactly ${remaining} questions; exactly four options per question; c is the zero-based correct option; one unambiguous correct answer; test different concepts, angles, or applications; never reveal the answer in the question; keep all wording appropriate for the selected learning level.`;

      const result = await generateText({
        model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
        prompt,
        maxOutputTokens: outputTokens,
        temperature: 0.35,
      });

      const parsed = cleanJson(result.text);
      const valid = validQuestions(Array.isArray(parsed) ? parsed : []);
      for (const item of valid) {
        const key = normalizeQuestion(item.q);
        if (!seen.has(key)) {
          seen.add(key);
          questions.push(item);
          if (questions.length >= count) break;
        }
      }
    }

    if (questions.length !== count) {
      return NextResponse.json({ error: `Mah Buddy could only create ${questions.length} unique questions out of ${count}. Please try again.` }, { status: 422 });
    }

    return NextResponse.json({ questions, learningLevel, difficulty });
  } catch (error) {
    console.error("Mah Buddy quiz error:", error);
    return NextResponse.json({ error: "Mah Buddy could not create the quiz right now." }, { status: 500 });
  }
}
