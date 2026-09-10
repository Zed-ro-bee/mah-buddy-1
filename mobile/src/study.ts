export type StudyMode = 'quiz' | 'flashcards';
export type StudyDifficulty = 'easy' | 'normal' | 'hard';

export type StudyItem = {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
};

export type StudySession = {
  mode: StudyMode;
  topic: string;
  difficulty: StudyDifficulty;
  count: number;
  items: StudyItem[];
  currentIndex: number;
  answered: number[];
};

const memoryKey = (userId: string, mode: StudyMode) => `mah-buddy.native.study.${mode}.v1.${userId}`;
const MAX_MEMORY = 100;

export async function loadStudyMemory(userId: string, mode: StudyMode): Promise<string[]> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem(memoryKey(userId, mode));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(-MAX_MEMORY) : [];
  } catch {
    return [];
  }
}

export async function rememberStudyItems(userId: string, mode: StudyMode, items: StudyItem[]) {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const existing = await loadStudyMemory(userId, mode);
    const fingerprints = items.map(item => fingerprint(item.question));
    const merged = [...existing, ...fingerprints].filter((value, index, all) => all.indexOf(value) === index).slice(-MAX_MEMORY);
    await AsyncStorage.setItem(memoryKey(userId, mode), JSON.stringify(merged));
  } catch {
    // Study memory is an enhancement; generation still works if local storage is unavailable.
  }
}

export function fingerprint(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[“”"'`.,!?;:()[\]{}]/g, '');
}

export function normaliseCount(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(50, Math.max(1, Math.floor(parsed)));
}

export function buildStudyPrompt(topic: string, mode: StudyMode, difficulty: StudyDifficulty, count: number, previous: string[]): string {
  const safeCount = normaliseCount(count);
  const memory = previous.slice(-50);
  const modeRules = mode === 'quiz'
    ? 'Create multiple-choice questions. Each item must have exactly four options, one correct answer, and a concise explanation.'
    : 'Create flashcards. Each item must have a clear question/front and a concise but useful answer/back.';
  const memoryRules = memory.length
    ? `Do not repeat or closely paraphrase these previous ${mode} questions:\n${memory.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
    : 'There are no previous items to avoid yet.';

  return [
    `Generate exactly ${safeCount} ${mode} for the topic: ${topic.trim() || 'the requested subject'}.`,
    `Difficulty: ${difficulty}.`,
    modeRules,
    'Return only valid JSON in this shape: {"items":[{"question":"...","answer":"...","options":["..."],"explanation":"..."}]}.',
    `The answer must match one option exactly for quiz mode. For flashcards, omit options.`,
    'Make the items varied and educational, not repetitive.',
    memoryRules,
  ].join('\n\n');
}

export function parseStudyResponse(raw: string, mode: StudyMode, requestedCount: number): StudyItem[] {
  const safeCount = normaliseCount(requestedCount);
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    const source = Array.isArray(parsed?.items) ? parsed.items : [];
    const items: StudyItem[] = source.map((item: any, index: number) => {
      const options = Array.isArray(item?.options) ? item.options.map((v: unknown) => String(v)).filter(Boolean).slice(0, 4) : undefined;
      return {
        id: `${Date.now()}-${index}`,
        question: String(item?.question || '').trim(),
        answer: String(item?.answer || '').trim(),
        ...(mode === 'quiz' && options ? { options } : {}),
        ...(item?.explanation ? { explanation: String(item.explanation).trim() } : {}),
      };
    }).filter((item: StudyItem) => item.question && item.answer);

    const unique: StudyItem[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      const key = fingerprint(item.question);
      if (!seen.has(key)) { seen.add(key); unique.push(item); }
      if (unique.length >= safeCount) break;
    }
    return unique;
  } catch {
    return [];
  }
}
