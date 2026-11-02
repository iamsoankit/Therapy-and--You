import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Composer } from "@/components/journal/Composer";
import { EntryTimeline } from "@/components/journal/EntryTimeline";
import { InsightsPanel } from "@/components/journal/InsightsPanel";
import { Onboarding } from "@/components/journal/Onboarding";
import { SideRail } from "@/components/journal/SideRail";
import { ThemeToggle } from "@/components/journal/ThemeToggle";
import {
  createEntry,
  greeting,
  loadEntries,
  loadName,
  saveEntries,
  saveName,
  type Entry,
} from "@/lib/journal";
import { DEFAULT_PREFS, GOALS, intention, loadPrefs, savePrefs, type Prefs } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Therapy & You — A private journal that understands you" },
      {
        name: "description",
        content:
          "A private mental-health journal that reads your words with care: sentiment, emotions, recurring themes and kind insights, all kept on your device.",
      },
      { property: "og:title", content: "Therapy & You — A private journal that understands you" },
      {
        property: "og:description",
        content:
          "Write freely. Therapy & You quietly notices your feelings, themes and mood over time — privately, on your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [active, setActive] = useState("write");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const writeRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadPrefs();
    const storedName = loadName();
    setEntries(loadEntries());
    setName(storedName);
    setPrefs({ ...stored, name: stored.name || storedName });
    setShowOnboarding(!stored.completed);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveEntries(entries);
  }, [entries, hydrated]);

  function handleSave(body: string) {
    setEntries((prev) => [createEntry(body), ...prev]);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function completeOnboarding(next: Prefs) {
    setPrefs(next);
    savePrefs(next);
    setName(next.name);
    saveName(next.name);
    if (next.privacy.includes("seed")) setEntries([]);
    setShowOnboarding(false);
  }

  function skipOnboarding() {
    const next = { ...prefs, completed: true };
    setPrefs(next);
    savePrefs(next);
    setShowOnboarding(false);
  }

  function navigate(id: string) {
    setActive(id);
    const target =
      id === "entries"
        ? entriesRef.current
        : id === "insights"
          ? insightsRef.current
          : writeRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const blurEntries = prefs.privacy.includes("lock");

  return (
    <div className="flex min-h-screen">
      {showOnboarding && (
        <Onboarding initial={prefs} onComplete={completeOnboarding} onSkip={skipOnboarding} />
      )}

      <SideRail active={active} onNavigate={navigate} />

      <main className="grid-canvas min-w-0 flex-1 px-5 py-8 sm:px-10 sm:py-10">
        {/* Top bar */}
        <div className="animate-rise mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-3xl font-extrabold tracking-tighter sm:text-4xl">
                {greeting()},
              </h1>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                onBlur={() => {
                  const clean = name.trim();
                  saveName(clean);
                  const next = { ...prefs, name: clean };
                  setPrefs(next);
                  savePrefs(next);
                }}
                placeholder="your name"
                aria-label="Your name"
                autoComplete="off"
                className="w-44 border-b-2 border-dashed border-clay/30 bg-transparent font-display text-3xl font-extrabold tracking-tighter text-clay outline-none transition-colors duration-300 placeholder:text-clay/30 focus:border-clay sm:text-4xl"
              />
            </div>
            {prefs.completed && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-ink-soft">
                  {intention(prefs)}
                </span>
                {prefs.goals.slice(0, 3).map((g) => {
                  const meta = GOALS.find((x) => x.key === g);
                  return meta ? (
                    <span
                      key={g}
                      className="rounded-full border border-clay/25 bg-clay-soft px-3 py-1 text-xs font-bold text-clay"
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft xl:block">
              private · on this device
            </p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-clay/40 hover:text-clay"
            >
              Set up
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            <div ref={writeRef} className="scroll-mt-8">
              <Composer onSave={handleSave} />
            </div>

            <section ref={entriesRef} className="scroll-mt-8">
              <div className="mb-4 flex items-baseline justify-between px-1">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-soft">
                  Recent reflections
                </h2>
                <span className="text-xs font-semibold text-ink-soft">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div className={blurEntries ? "privacy-veil" : undefined}>
                <EntryTimeline entries={entries} onDelete={handleDelete} />
              </div>
            </section>
          </div>

          <div ref={insightsRef} className="scroll-mt-8">
            <InsightsPanel entries={entries} insights={prefs.insights} />
          </div>
        </div>

        <footer className="mt-14 border-t border-border pt-6 text-center text-xs text-ink-soft">
          Made gently. Your entries never leave this device.
        </footer>
      </main>
    </div>
  );
}
