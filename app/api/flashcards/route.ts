import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const LEVELS: Record<string, string> = {
  Foundation: "A1–A2: use very simple English, short sentences, basic concepts, and clear everyday examples. Define unfamiliar terms immediately.",
  Developing: "B1: use clear everyday English, moderate concepts, practical examples, and moderate explanation depth.",
  Proficient: "B2: use fluent natural English, subject terminology with brief clarification, deeper explanations, and useful examples.",
  Advanced: "C1: use precise academic English, nuanced vocabulary, detailed reasoning, and fewer simplifications.",
  Expert: "C2: use sophisticated precise English, advanced terminology, rigorous reasoning, and full depth.",
};

const DIFFICULTIES: Record<string, string> = {
  Easy: "basic recall and understanding; straightforward concepts and familiar examples",
  Normal: "understanding and application; moderate reasoning and useful distinctions",
  Hard: "deeper analysis, multi-step reasoning, challenging distinctions, and advanced application",
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
  if (start < 0 || end < start) throw new Error("The AI did not return a valid flashcard list.");
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validCards(items: unknown[]) {
  return items
    .filter((x: any) => x && typeof x.q === "string" && x.q.trim() && typeof x.a === "string" && x.a.trim())
    .map((x: any) => ({ q: x.q.trim(), a: x.a.trim() }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = String(body.topic || "General study").slice(0, 180);
    const difficulty = normalizeDifficulty(body.difficulty);
    const learningLevel = LEVELS[body.learningLevel] ? String(body.learningLevel) : "Developing";
    const age = String(body.age || "").slice(0, 20);
    const currentStudies = String(body.currentStudies || "").slice(0, 160);
    const goal = String(body.goal || "").slice(0, 160);
    const count = Math.max(1, Math.min(100, Number(body.count) || 10));
    const previous = Array.isArray(body.previousQuestions) ? body.previousQuestions.slice(-100).map(String) : [];

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return NextResponse.json({ error: "Mah Buddy AI is not connected yet." }, { status: 503 });

    const collected: { q: string; a: string }[] = [];
    const seen = new Set([...previous, ...collected].map(normalizeQuestion));
    let attempts = 0;

    while (collected.length < count && attempts < 3) {
      attempts += 1;
      const remaining = count - collected.length;
      const outputTokens = Math.min(12000, Math.max(1200, remaining * 70));
      const prompt = `Create exactly ${remaining} DIFFERENT flashcards about: ${topic}.
Difficulty: ${difficulty} — ${DIFFICULTIES[difficulty]}.
Learning/language level: ${learningLevel} — ${LEVELS[learningLevel]}.
Learner age: ${age || "not provided"}.
Current studies: ${currentStudies || "not provided"}.
Learning goal: ${goal || "not provided"}.
Use learning level to control language, vocabulary, assumed knowledge, and explanation depth. Use age to control maturity, examples, pacing, and appropriateness. Use current studies and goal to make academic examples and terminology relevant where possible. Do not invent a specific grade, curriculum, syllabus, or subject that was not supplied.
Do not repeat, paraphrase, or reuse any question in the excluded list.
Excluded questions: ${JSON.stringify([...seen].slice(-100))}
Return ONLY valid JSON with no markdown, exactly in this shape:
[{"q":"question","a":"answer"}]
Rules: exactly ${remaining} cards; each question must test a different concept, fact, process, example, or useful distinction; answers must be accurate and concise; do not put multiple questions in one card; never reveal a different card's answer in the question; keep wording age-appropriate and matched to the selected learning level and current studies.`;

      const result = await generateText({
        model: google(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
        prompt,
        maxOutputTokens: outputTokens,
        temperature: 0.35,
      });

      const parsed = cleanJson(result.text);
      const valid = validCards(Array.isArray(parsed) ? parsed : []);
      for (const card of valid) {
        const key = normalizeQuestion(card.q);
        if (!seen.has(key)) {
          seen.add(key);
          collected.push(card);
          if (collected.length >= count) break;
        }
      }
    }

    if (collected.length !== count) {
      return NextResponse.json({ error: `Mah Buddy could only create ${collected.length} unique flashcards out of ${count}. Please try again.` }, { status: 422 });
    }

    return NextResponse.json({ cards: collected, learningLevel, difficulty });
  } catch (error) {
    console.error("Mah Buddy flashcards error:", error);
    return NextResponse.json({ error: "Mah Buddy could not create the flashcards right now." }, { status: 500 });
  }
}
