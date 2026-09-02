import { useState } from "react";
import { EMOTION_META, type Entry, type EmotionKey } from "@/lib/journal";
import { CHIP_TONE } from "./tone";

function when(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round((today.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  const label = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`;
  return `${label}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function EntryTimeline({ entries, onDelete }: { entries: Entry[]; onDelete: (id: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!entries.length) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-ink-soft">
        No entries yet. Whatever you write first will be waiting here for you.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => {
        const open = openId === entry.id;
        const tone =
          entry.sentiment >= 0.08
            ? CHIP_TONE["moss"]
            : entry.sentiment <= -0.08
              ? CHIP_TONE["rose"]
              : CHIP_TONE["amber"];
        const toneLabel =
          entry.sentiment >= 0.08 ? "Warm" : entry.sentiment <= -0.08 ? "Tender" : "Mixed";

        return (
          <article
            key={entry.id}
            className="animate-rise group rounded-2xl border border-border bg-card p-6 shadow-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-clay/30 hover:shadow-lift"
            style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : entry.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink-soft">{when(entry.createdAt)}</span>
                <span className="mt-1 block font-display text-lg font-bold tracking-tight text-balance">
                  {entry.title}
                </span>
                {!open && (
                  <span className="mt-1.5 block line-clamp-2 text-[15px] text-ink-soft text-pretty">
                    {entry.body}
                  </span>
                )}
              </span>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${tone}`}
                aria-hidden
              >
                {toneLabel}
              </span>
            </button>

            {open && (
              <div className="animate-rise mt-5 space-y-4 border-t border-border pt-5">
                <p className="whitespace-pre-line text-[15px] leading-[1.8] text-ink/90 text-pretty">
                  {entry.body}
                </p>

                <div className="flex flex-wrap gap-2">
                  {entry.emotions.map(({ key }) => {
                    const meta = EMOTION_META[key as EmotionKey];
                    return (
                      <span
                        key={key}
                        className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${CHIP_TONE[meta.tone]}`}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-secondary/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">
                    What Sprout noticed
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/90 text-pretty">{entry.insight}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">
                    Sentiment {entry.sentiment > 0 ? "+" : ""}
                    {entry.sentiment.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-bold text-ink-soft transition-colors duration-300 hover:text-destructive"
                  >
                    Let this one go
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
