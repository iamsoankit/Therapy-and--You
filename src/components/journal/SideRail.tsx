type Item = {
  id: string;
  label: string;
  path: string;
};

const ITEMS: Item[] = [
  {
    id: "write",
    label: "Write",
    path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    id: "entries",
    label: "Entries",
    path: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    id: "insights",
    label: "Insights",
    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

function Icon({ path }: { path: string }) {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export function SideRail({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-10 border-r border-border bg-card py-8 sm:flex"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-accent)]">
        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        {ITEMS.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={on ? "true" : undefined}
              className={`rounded-xl p-3 transition-all duration-300 hover:-translate-y-0.5 ${
                on
                  ? "bg-clay/10 text-clay"
                  : "text-ink-soft hover:bg-secondary hover:text-ink"
              }`}
            >
              <Icon path={item.path} />
            </button>
          );
        })}
      </div>

      <span className="mt-auto size-8 rounded-full bg-secondary ring-1 ring-border" aria-hidden />
    </nav>
  );
}
