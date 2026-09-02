/**
 * Onboarding preferences: goals, privacy expectations and the kind of insights
 * the person wants. Stored locally alongside entries — nothing leaves the device.
 */

export type GoalKey =
  | "understand"
  | "calm"
  | "habit"
  | "patterns"
  | "gratitude"
  | "therapy";

export type InsightKey = "gentle" | "patterns" | "prompts" | "data";

export type PrivacyKey = "device" | "lock" | "seed";

export type Prefs = {
  name: string;
  goals: GoalKey[];
  privacy: PrivacyKey[];
  insights: InsightKey[];
  reminder: "none" | "morning" | "evening";
  completed: boolean;
};

export const GOALS: { key: GoalKey; label: string; hint: string; emoji: string }[] = [
  { key: "understand", label: "Understand my feelings", hint: "Name what's going on inside", emoji: "🫧" },
  { key: "calm", label: "Feel calmer", hint: "Somewhere to put the noise down", emoji: "🌿" },
  { key: "habit", label: "Build a writing habit", hint: "A few honest lines most days", emoji: "🗓️" },
  { key: "patterns", label: "Spot my patterns", hint: "What lifts me, what drains me", emoji: "🧩" },
  { key: "gratitude", label: "Notice the good", hint: "Small warm things, on record", emoji: "🍞" },
  { key: "therapy", label: "Prepare for therapy", hint: "Bring context to sessions", emoji: "🪑" },
];

export const PRIVACY: { key: PrivacyKey; label: string; hint: string }[] = [
  { key: "device", label: "Keep everything on this device", hint: "No account, no upload, no sync" },
  { key: "lock", label: "Blur entries until I tap them", hint: "Safer on shared screens" },
  { key: "seed", label: "Start empty", hint: "Remove the example entries" },
];

export const INSIGHTS: { key: InsightKey; label: string; hint: string; emoji: string }[] = [
  { key: "gentle", label: "Gentle reflections", hint: "Sprout mirrors back what it hears", emoji: "💬" },
  { key: "patterns", label: "Themes & recurring words", hint: "What keeps coming up", emoji: "🔁" },
  { key: "prompts", label: "Follow-up prompts", hint: "One question to go deeper", emoji: "❓" },
  { key: "data", label: "Mood charts & numbers", hint: "Trends, emotion mix, streaks", emoji: "📈" },
];

export const DEFAULT_PREFS: Prefs = {
  name: "",
  goals: ["understand", "patterns"],
  privacy: ["device"],
  insights: ["gentle", "patterns", "data"],
  reminder: "evening",
  completed: false,
};

const PREFS_KEY = "therapy-and-you:prefs:v1";

export function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function goalLabel(key: GoalKey) {
  return GOALS.find((g) => g.key === key)?.label ?? key;
}

/** A short line summarising why they're here, used in the app shell. */
export function intention(prefs: Prefs) {
  if (!prefs.goals.length) return "Write whatever's here today.";
  const first = goalLabel(prefs.goals[0]!).toLowerCase();
  return prefs.goals.length > 1
    ? `Here to ${first} · +${prefs.goals.length - 1} more`
    : `Here to ${first}`;
}
