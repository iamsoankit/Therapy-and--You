import { useState } from "react";
import companion from "@/assets/companion.png";
import {
  GOALS,
  INSIGHTS,
  PRIVACY,
  type GoalKey,
  type InsightKey,
  type Prefs,
  type PrivacyKey,
} from "@/lib/prefs";

const STEPS = ["You", "Goals", "Privacy", "Insights"] as const;

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const cardBase =
  "group w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5";
const cardOn = "border-primary bg-primary/8 shadow-[var(--shadow-accent)]";
const cardOff = "border-border bg-card hover:border-primary/40";

export function Onboarding({
  initial,
  onComplete,
  onSkip,
}: {
  initial: Prefs;
  onComplete: (prefs: Prefs) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Prefs>(initial);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const last = step === STEPS.length - 1;

  function next() {
    if (last) onComplete({ ...draft, name: draft.name.trim(), completed: true });
    else setStep((s) => s + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set up your journal"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="animate-rise my-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-paper sm:p-9">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={companion}
              alt="Sprout, your journaling companion"
              width={816}
              height={816}
              className="animate-sway size-11 object-contain"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </p>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">
                {step === 0 && "Let's set this up together"}
                {step === 1 && "What would you like from this?"}
                {step === 2 && "How private should it feel?"}
                {step === 3 && "What kind of insights help you?"}
              </h2>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:bg-secondary"
          >
            Skip
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div key={step} className="animate-rise mt-7">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Four quick questions — under a minute. It shapes your prompts, your insight cards
                and how much the app keeps to itself. You can change all of it later.
              </p>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                  What should I call you?
                </span>
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value.slice(0, 24))}
                  placeholder="your name"
                  autoFocus
                  autoComplete="off"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 font-display text-xl font-bold tracking-tight outline-none transition-colors focus:border-primary"
                />
              </label>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                  When do you like to write?
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { key: "morning", label: "Mornings ☀️" },
                      { key: "evening", label: "Evenings 🌙" },
                      { key: "none", label: "No routine yet" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.key}
                      onClick={() => set("reminder", o.key)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
                        draft.reminder === o.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => {
                const on = draft.goals.includes(g.key);
                return (
                  <button
                    key={g.key}
                    aria-pressed={on}
                    onClick={() => set("goals", toggle<GoalKey>(draft.goals, g.key))}
                    className={`${cardBase} ${on ? cardOn : cardOff}`}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <p className="mt-1.5 font-display text-[15px] font-bold tracking-tight">
                      {g.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{g.hint}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Nothing you write is ever uploaded — there's no account and no server. Choose
                anything extra you want:
              </p>
              {PRIVACY.map((p) => {
                const on = draft.privacy.includes(p.key);
                return (
                  <button
                    key={p.key}
                    aria-pressed={on}
                    onClick={() => set("privacy", toggle<PrivacyKey>(draft.privacy, p.key))}
                    className={`${cardBase} flex items-center gap-4 ${on ? cardOn : cardOff}`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span>
                      <span className="block font-display text-[15px] font-bold tracking-tight">
                        {p.label}
                      </span>
                      <span className="block text-xs text-ink-soft">{p.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {INSIGHTS.map((o) => {
                const on = draft.insights.includes(o.key);
                return (
                  <button
                    key={o.key}
                    aria-pressed={on}
                    onClick={() => set("insights", toggle<InsightKey>(draft.insights, o.key))}
                    className={`${cardBase} ${on ? cardOn : cardOff}`}
                  >
                    <span className="text-lg">{o.emoji}</span>
                    <p className="mt-1.5 font-display text-[15px] font-bold tracking-tight">
                      {o.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">{o.hint}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-secondary disabled:opacity-0"
          >
            Back
          </button>
          <button
            onClick={next}
            className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-accent)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {last ? "Start journaling" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
