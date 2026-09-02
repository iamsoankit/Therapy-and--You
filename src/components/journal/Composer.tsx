import { useMemo, useState } from "react";
import { analyze, EMOTION_META, PROMPTS, type EmotionKey } from "@/lib/journal";
import { CHIP_TONE } from "./tone";

type Props = {
  onSave: (body: string) => void;
};

export function Composer({ onSave }: Props) {
  const [body, setBody] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const live = useMemo(() => analyze(body), [body]);
  const canSave = live.wordCount >= 3;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function handleSave() {
    if (!canSave) return;
    onSave(body);
    setBody("");
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2600);
  }

  return (
    <section className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-paper sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            <span className="size-2 animate-pulse rounded-full bg-clay" />
            {today}
          </p>
          <h2 className="mt-3 max-w-[26ch] font-display text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-[28px]">
            {PROMPTS[promptIndex]}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setPromptIndex((i) => (i + 1) % PROMPTS.length)}
          className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-clay/40 hover:text-ink"
        >
          Ask me something else
        </button>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        placeholder="Start typing your thoughts…"
        aria-label="Journal entry"
        className="mt-6 w-full resize-none rounded-2xl bg-secondary/70 p-6 text-[16px] leading-[1.8] text-ink outline-none ring-2 ring-transparent transition-all duration-300 placeholder:text-ink-soft/60 focus:bg-secondary/40 focus:ring-clay/25"
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
          {live.emotions.length ? "I'm hearing" : "Feelings show up here"}
        </span>
        {live.emotions.map(({ key }, i) => {
          const meta = EMOTION_META[key as EmotionKey];
          return (
            <span
              key={key}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`animate-pop rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${CHIP_TONE[meta.tone]}`}
            >
              {meta.emoji} {meta.label}
            </span>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <p className="text-sm text-ink-soft">
          {live.wordCount === 0
            ? "Nothing leaves this device."
            : `${live.wordCount} ${live.wordCount === 1 ? "word" : "words"} · saved only for you`}
        </p>
        <div className="flex items-center gap-3">
          {justSaved && <span className="animate-pop text-sm font-bold text-moss">Kept safe 🌿</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-accent)] transition-all duration-300 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
          >
            Save entry
          </button>
        </div>
      </div>
    </section>
  );
}
