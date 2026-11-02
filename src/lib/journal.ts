/**
 * Journal domain logic: entries, on-device text parsing, sentiment scoring,
 * emotion detection, keyword extraction and insight generation.
 *
 * Everything runs locally in the browser so nothing private leaves the device.
 */

export type EmotionKey = "calm" | "grateful" | "hopeful" | "tender" | "anxious" | "heavy" | "tired";

export type Entry = {
  id: string;
  createdAt: string; // ISO
  title: string;
  body: string;
  /** -1 … 1 */
  sentiment: number;
  emotions: { key: EmotionKey; weight: number }[];
  keywords: string[];
  insight: string;
};

export const EMOTION_META: Record<
  EmotionKey,
  { label: string; emoji: string; tone: "moss" | "amber" | "clay" | "rose" | "sage" }
> = {
  calm: { label: "Calm", emoji: "🌿", tone: "moss" },
  grateful: { label: "Grateful", emoji: "🍞", tone: "amber" },
  hopeful: { label: "Hopeful", emoji: "🌤️", tone: "amber" },
  tender: { label: "Tender", emoji: "🫧", tone: "rose" },
  anxious: { label: "Anxious", emoji: "🌀", tone: "clay" },
  heavy: { label: "Heavy", emoji: "🌧️", tone: "sage" },
  tired: { label: "Tired", emoji: "🌙", tone: "sage" },
};

const EMOTION_LEXICON: Record<EmotionKey, string[]> = {
  calm: [
    "calm",
    "quiet",
    "still",
    "slow",
    "peace",
    "breathe",
    "gentle",
    "soft",
    "rest",
    "settled",
    "ease",
  ],
  grateful: [
    "grateful",
    "thankful",
    "lucky",
    "appreciate",
    "gift",
    "warm",
    "kind",
    "love",
    "grace",
  ],
  hopeful: [
    "hope",
    "maybe",
    "better",
    "tomorrow",
    "forward",
    "try",
    "start",
    "possible",
    "light",
    "excited",
  ],
  tender: [
    "miss",
    "tender",
    "cry",
    "soft spot",
    "hug",
    "forgive",
    "sorry",
    "sweet",
    "ache",
    "care",
  ],
  anxious: [
    "anxious",
    "worry",
    "worried",
    "nervous",
    "panic",
    "spiral",
    "overthink",
    "stress",
    "afraid",
    "tight",
    "racing",
  ],
  heavy: [
    "heavy",
    "sad",
    "empty",
    "hard",
    "lonely",
    "grey",
    "gray",
    "low",
    "hurt",
    "stuck",
    "too much",
  ],
  tired: ["tired", "exhausted", "drained", "sleep", "burnt", "no energy", "worn", "late", "foggy"],
};

const POSITIVE = [
  "good",
  "better",
  "happy",
  "joy",
  "warm",
  "love",
  "kind",
  "calm",
  "grateful",
  "hope",
  "proud",
  "laugh",
  "smile",
  "gentle",
  "rest",
  "enough",
  "light",
  "soft",
  "helped",
  "ease",
];

const NEGATIVE = [
  "bad",
  "worse",
  "sad",
  "angry",
  "afraid",
  "anxious",
  "worry",
  "tired",
  "heavy",
  "hurt",
  "lonely",
  "stuck",
  "hate",
  "guilt",
  "shame",
  "panic",
  "cried",
  "empty",
  "stress",
  "tight",
];

const STOPWORDS = new Set(
  "i me my myself we our you your he him his she her it its they them the a an and or but if then than that this these those of to in on at for with from by as is am are was were be been being do does did doing have has had having so just really very much more most some any all not no nor own same too can will would should could about after again before because there here when what which who whom how out up down over under only other into your yours".split(
    " ",
  ),
);

function words(text: string) {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function countMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  let n = 0;
  for (const term of terms) {
    if (term.includes(" ")) {
      if (lower.includes(term)) n += 1;
    } else {
      const re = new RegExp(`\\b${term}`, "g");
      n += (lower.match(re) ?? []).length;
    }
  }
  return n;
}

export function analyze(body: string): {
  sentiment: number;
  emotions: { key: EmotionKey; weight: number }[];
  keywords: string[];
  insight: string;
  wordCount: number;
} {
  const wordList = words(body);
  const wordCount = wordList.length;

  const pos = countMatches(body, POSITIVE);
  const neg = countMatches(body, NEGATIVE);
  const sentiment = pos + neg === 0 ? 0 : Number(((pos - neg) / (pos + neg + 2)).toFixed(2));

  const raw = (Object.keys(EMOTION_LEXICON) as EmotionKey[]).map((key) => ({
    key,
    hits: countMatches(body, EMOTION_LEXICON[key]),
  }));
  const total = raw.reduce((sum, r) => sum + r.hits, 0);
  const emotions = total
    ? raw
        .filter((r) => r.hits > 0)
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 4)
        .map((r) => ({ key: r.key, weight: Math.round((r.hits / total) * 100) }))
    : [];

  const freq = new Map<string, number>();
  for (const w of wordList) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([w]) => w);

  return {
    sentiment,
    emotions,
    keywords,
    insight: buildInsight(sentiment, emotions, wordCount),
    wordCount,
  };
}

function buildInsight(
  sentiment: number,
  emotions: { key: EmotionKey; weight: number }[],
  wordCount: number,
): string {
  if (wordCount < 12) {
    return "Even a few words count. When you're ready, tell me a little more about how the day sat with you.";
  }
  const top = emotions[0]?.key;
  const second = emotions[1]?.key;

  if (top === "anxious" || top === "heavy") {
    return `There's real weight in this one, and you still showed up to write it down — that matters. ${
      second
        ? `A thread of ${EMOTION_META[second].label.toLowerCase()} runs underneath it too. `
        : ""
    }Be as kind to yourself tonight as you'd be to a friend.`;
  }
  if (top === "tired") {
    return "You sound depleted rather than unhappy. Rest isn't something you have to earn — try letting one thing stay unfinished today.";
  }
  if (top === "grateful" || top === "hopeful") {
    return "You keep noticing the small warm things, and that noticing is a skill. Worth remembering on the greyer days.";
  }
  if (top === "calm") {
    return "This entry moves slowly, in a good way. Whatever you did to get here, it's worth doing again.";
  }
  if (sentiment > 0.15)
    return "The tone here leans gently upward. Something is working — see if you can name it.";
  if (sentiment < -0.15)
    return "This reads tender and unresolved. You don't have to fix it today; you just had to say it.";
  return "Mixed and honest — two feelings can be true at once. Naming them is already the work.";
}

export function titleFrom(body: string) {
  const first = body.trim().split(/(?<=[.!?])\s|\n/)[0] ?? "";
  const clean = first.replace(/\s+/g, " ").trim();
  if (!clean) return "Untitled entry";
  return clean.length > 58 ? `${clean.slice(0, 55).trimEnd()}…` : clean;
}

export function createEntry(body: string): Entry {
  const { sentiment, emotions, keywords, insight } = analyze(body);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    title: titleFrom(body),
    body: body.trim(),
    sentiment,
    emotions,
    keywords,
    insight,
  };
}

/* ---------- Storage ---------- */

const STORAGE_KEY = "therapy-and-you:entries:v1";
const NAME_KEY = "therapy-and-you:name:v1";

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEntries();
    const parsed = JSON.parse(raw) as Entry[];
    return Array.isArray(parsed) ? parsed : seedEntries();
  } catch {
    return seedEntries();
  }
}

export function saveEntries(entries: Entry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function saveName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(20 - n, 12, 0, 0);
  return d.toISOString();
}

function seedEntries(): Entry[] {
  const drafts: { days: number; body: string }[] = [
    {
      days: 1,
      body: "The light came in low and slow this morning and I made tea before my feet were fully awake. I walked past the bakery and the smell of warm bread followed me two blocks. Even when things feel heavy, the small warm things still find a way to reach me. I think I felt something close to calm.",
    },
    {
      days: 3,
      body: "Not every day will be golden. Today was grey and my chest felt tight for most of the afternoon, and I kept overthinking the meeting. I am tired in a way sleep does not fix. I am trying to let the weather of my mind be allowed to be overcast without making it mean something about me.",
    },
    {
      days: 5,
      body: "I wrote the letter out by hand instead of on the screen. Something about the ink made forgiveness feel possible. I miss them, and I think I can hold that softly now instead of carrying it. I am grateful for the quiet hour it took.",
    },
  ];
  return drafts.map(({ days, body }) => {
    const { sentiment, emotions, keywords, insight } = analyze(body);
    return {
      id: `seed-${days}`,
      createdAt: daysAgo(days),
      title: titleFrom(body),
      body,
      sentiment,
      emotions,
      keywords,
      insight,
    };
  });
}

/* ---------- Aggregates ---------- */

export function weekTrend(entries: Entry[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayEntries = entries.filter(
      (e) => new Date(e.createdAt).toDateString() === d.toDateString(),
    );
    const avg = dayEntries.length
      ? dayEntries.reduce((s, e) => s + e.sentiment, 0) / dayEntries.length
      : null;
    return {
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      date: d,
      value: avg,
      count: dayEntries.length,
    };
  });
}

export function emotionMix(entries: Entry[]) {
  const totals = new Map<EmotionKey, number>();
  for (const e of entries) {
    for (const em of e.emotions) totals.set(em.key, (totals.get(em.key) ?? 0) + em.weight);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (!sum) return [];
  return [...totals.entries()]
    .map(([key, v]) => ({ key, percent: Math.round((v / sum) * 100) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
}

export function averageSentiment(entries: Entry[]) {
  if (!entries.length) return 0;
  return entries.reduce((s, e) => s + e.sentiment, 0) / entries.length;
}

export function streak(entries: Entry[]) {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => new Date(e.createdAt).toDateString()));
  let count = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

export const PROMPTS = [
  "What did today ask of you?",
  "What is one small thing that reached you today?",
  "Where did you feel it in your body?",
  "What would you tell a friend who had your day?",
  "What are you carrying that you could set down for an hour?",
  "What went softer than you expected?",
];
