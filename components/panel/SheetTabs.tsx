"use client";

export type SheetTabItem = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
  className?: string;
};

export default function SheetTabs({ tabs, activeId, onChange, children, className = "" }: Props) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="min-h-[200px] rounded-t-lg border border-b-0 border-border bg-card p-4 sm:p-5">
        {children}
      </div>
      <div
        className="flex items-end gap-0 overflow-x-auto border-b border-border bg-[#ececec] px-1 pt-1 dark:bg-muted/40"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={[
                "relative shrink-0 rounded-t-md border px-4 py-2 text-sm font-medium transition",
                active
                  ? "z-10 -mb-px border-border border-b-card bg-card text-foreground shadow-[0_-1px_0_0_hsl(var(--card))]"
                  : "border-transparent bg-[#f3f3f3] text-muted-foreground hover:bg-[#fafafa] hover:text-foreground dark:bg-muted/60",
              ].join(" ")}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1.5 tabular-nums ${active ? "text-muted-foreground" : "text-muted-foreground/80"}`}
                >
                  ({tab.count > 99 ? "99+" : tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
