import companion from "@/assets/companion.png";
import {
  EMOTION_META,
  PROMPTS,
  averageSentiment,
  emotionMix,
  streak,
  weekTrend,
  type Entry,
  type EmotionKey,
} from "@/lib/journal";
import type { InsightKey } from "@/lib/prefs";
import { BAR_TONE, CHIP_TONE } from "./tone";

function sentimentWord(v: number) {
  if (v > 0.3) return "warm";
  if (v > 0.08) return "gently up";
  if (v < -0.3) return "tender";
  if (v < -0.08) return "a bit low";
  return "mixed";
}

export function InsightsPanel({
  entries,
  insights = ["gentle", "patterns", "prompts", "data"],
}: {
  entries: Entry[];
  insights?: InsightKey[];
}) {
  const avg = averageSentiment(entries);
  const mix = emotionMix(entries);
  const trend = weekTrend(entries);
  const days = streak(entries);
  const latest = entries[0];
  const keywords = [...new Set(entries.slice(0, 4).flatMap((e) => e.keywords))].slice(0, 8);
  const show = (k: InsightKey) => insights.includes(k);
  const followUp = latest
    ? PROMPTS[Math.abs(latest.id.length + latest.body.length) % PROMPTS.length]
    : PROMPTS[0];

  return (
    <aside className="space-y-6 lg:sticky lg:top-10">
      {/* Companion + reading */}
      {show("gentle") && (
        <div className="animate-rise group relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[var(--shadow-accent)]">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15">
                <img
                  src={companion}
                  alt="Sprout, your journaling companion"
                  width={816}
                  height={816}
                  loading="lazy"
                  className="animate-sway size-11 object-contain"
                />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/80">
                Sprout's reading
              </p>
            </div>
            <p className="mt-4 font-display text-[17px] font-semibold leading-snug tracking-tight text-pretty">
              {latest?.insight ?? "Write your first line and I'll sit with it beside you."}
            </p>
          </div>
          <span
            className="animate-breathe absolute -bottom-10 -right-8 size-40 rounded-full bg-white/10"
            aria-hidden
          />
        </div>
      )}

      {/* Follow-up prompt */}
      {show("prompts") && (
        <div className="animate-rise rounded-3xl border border-border bg-card p-7 shadow-paper">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            One question to go deeper
          </p>
          <p className="font-display text-[17px] font-semibold leading-snug tracking-tight text-pretty">
            {followUp}
          </p>
        </div>
      )}

      {/* Numbers */}
      {show("data") && (
        <div className="animate-rise rounded-3xl border border-border bg-card p-7 shadow-paper">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
                Lately you've felt
              </p>
              <p className="mt-1.5 font-display text-2xl font-extrabold capitalize tracking-tight">
                {sentimentWord(avg)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-extrabold leading-none tracking-tighter text-clay">
                {days}
              </p>
              <p className="text-xs font-semibold text-ink-soft">day streak</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-clay transition-all duration-700"
              style={{ width: `${Math.round(((avg + 1) / 2) * 100)}%` }}
            />
          </div>

          <div className="mt-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
              This week
            </p>
            <div className="flex h-24 items-end justify-between gap-1.5">
              {trend.map((d, i) => {
                const height =
                  d.value === null ? 6 : Math.max(12, Math.round(((d.value + 1) / 2) * 100));
                const tone =
                  d.value === null ? "bg-secondary" : d.value >= 0 ? "bg-clay/70" : "bg-rose/60";
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      title={`${d.date.toLocaleDateString()} · ${d.count} entries`}
                      className={`animate-grow-bar w-full rounded-t-md ${tone}`}
                      style={{ height: `${height}%`, animationDelay: `${i * 70}ms` }}
                    />
                    <span className="text-[10px] font-semibold text-ink-soft">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Emotion mix */}
      {show("data") && mix.length > 0 && (
        <div className="animate-rise rounded-3xl border border-border bg-card p-7 shadow-paper">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            Your emotion mix
          </p>
          <div className="space-y-4">
            {mix.map(({ key, percent }, i) => {
              const meta = EMOTION_META[key as EmotionKey];
              return (
                <div key={key}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="font-bold">
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="font-bold text-clay">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${BAR_TONE[meta.tone]} transition-all duration-700`}
                      style={{ width: `${percent}%`, transitionDelay: `${i * 80}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurring words */}
      {show("patterns") && keywords.length > 0 && (
        <div className="animate-rise rounded-3xl border border-border bg-card p-7 shadow-paper">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            Words you keep returning to
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${CHIP_TONE["sage"]}`}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-ink-soft">
        Private by design — your words stay on this device.
      </p>
    </aside>
  );
}
