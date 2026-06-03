"use client";

export type SheetTabItem = {
  id: string;
  label: string;
  /** İki satır etiket (ör. Benim / Tekliflerim) */
  lines?: [string, string];
  /** Kırmızı çerçeve vurgusu */
  redBorder?: boolean;
  count?: number;
};

type Props = {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  /** Excel: içerik üstte, sayfa sekmeleri altta */
  tabPosition?: "top" | "bottom";
};

function TabBar({
  tabs,
  activeId,
  onChange,
  edge,
}: {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  edge: "top" | "bottom";
}) {
  return (
    <div
      className={[
        "flex items-end gap-1 overflow-x-auto rounded-lg bg-primary/10 p-1 sm:gap-1.5",
        edge === "top" ? "mb-0" : "mt-0",
      ].join(" ")}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const countLabel =
          tab.count !== undefined && tab.count > 0
            ? tab.count > 99
              ? "99+"
              : String(tab.count)
            : null;
        const redFrame = tab.redBorder;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={tab.lines ? `${tab.lines[0]} ${tab.lines[1]}` : tab.label}
            onClick={() => onChange(tab.id)}
            className={[
              "relative shrink-0 rounded-md px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm",
              redFrame ? "border-2 border-red-500" : "",
              active
                ? redFrame
                  ? "bg-red-600 text-white shadow-md ring-2 ring-red-400/40"
                  : "bg-primary text-white shadow-md ring-2 ring-primary/30"
                : redFrame
                  ? "bg-red-50 text-red-800 hover:bg-red-100"
                  : "bg-white/80 text-secondary hover:bg-white hover:text-primary dark:bg-card/80",
            ].join(" ")}
          >
            {tab.lines ? (
              <span className="flex flex-col items-center gap-0 leading-tight">
                <span>{tab.lines[0]}</span>
                <span>{tab.lines[1]}</span>
              </span>
            ) : (
              tab.label
            )}
            {countLabel !== null && (
              <span
                className={[
                  "ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums sm:text-xs",
                  active ? "bg-white/25 text-white" : "bg-primary/15 text-primary",
                ].join(" ")}
              >
                {countLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function SheetTabs({
  tabs,
  activeId,
  onChange,
  children,
  className = "",
  tabPosition = "bottom",
}: Props) {
  const content = (
    <div
      className={[
        "min-h-[200px] min-w-0 border border-primary/15 bg-card p-4 sm:p-5",
        tabPosition === "bottom" ? "rounded-t-xl border-b-0" : "rounded-b-xl border-t-0",
      ].join(" ")}
    >
      {children}
    </div>
  );

  if (tabPosition === "top") {
    return (
      <div className={`flex min-w-0 flex-col ${className}`}>
        <TabBar tabs={tabs} activeId={activeId} onChange={onChange} edge="top" />
        {content}
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      {content}
      <TabBar tabs={tabs} activeId={activeId} onChange={onChange} edge="bottom" />
    </div>
  );
}
