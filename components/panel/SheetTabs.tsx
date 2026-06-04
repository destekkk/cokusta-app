"use client";

export type SheetTabAccent = "primary" | "amber" | "orange" | "emerald" | "red";

export type SheetTabItem = {
  id: string;
  label: string;
  /** İki satır etiket (ör. Benim / Tekliflerim) */
  lines?: [string, string];
  /** Kırmızı çerçeve vurgusu */
  redBorder?: boolean;
  count?: number;
  accent?: SheetTabAccent;
};

type Props = {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  /** Excel: içerik üstte, sayfa sekmeleri altta */
  tabPosition?: "top" | "bottom";
  /** Admin paneli tarzı tıklanabilir özet kartları */
  variant?: "bar" | "cards";
  /** Üstte PanelStatCard vb. varsa alt sekme çubuğunu gizle */
  hideTabBar?: boolean;
};

const accentNumberClass: Record<SheetTabAccent, string> = {
  primary: "text-primary",
  amber: "text-amber-600",
  orange: "text-orange-600",
  emerald: "text-emerald-600",
  red: "text-red-600",
};

function formatCount(count: number | undefined): string {
  if (count === undefined) return "0";
  if (count > 99) return "99+";
  return String(count);
}

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
          tab.count !== undefined && tab.count > 0 ? formatCount(tab.count) : null;
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

export function SheetTabCards({
  tabs,
  activeId,
  onChange,
}: {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const redFrame = tab.redBorder;
        const accent = tab.accent ?? (redFrame ? "red" : active ? "primary" : "amber");
        const numberClass = accentNumberClass[accent];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={tab.lines ? `${tab.lines[0]} ${tab.lines[1]}` : tab.label}
            onClick={() => onChange(tab.id)}
            className={[
              "rounded-xl border p-4 text-left transition sm:p-5",
              "hover:border-primary/40 hover:shadow-sm",
              active && redFrame
                ? "border-red-500 bg-red-50 ring-2 ring-red-300/50"
                : active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : redFrame
                    ? "border-red-300 bg-red-50/80"
                    : "border-border bg-card",
            ].join(" ")}
          >
            <div className={`text-2xl font-bold tabular-nums sm:text-3xl ${numberClass}`}>
              {formatCount(tab.count)}
            </div>
            {tab.lines ? (
              <div className="mt-1 text-sm font-medium leading-tight text-foreground">
                <div>{tab.lines[0]}</div>
                <div>{tab.lines[1]}</div>
              </div>
            ) : (
              <div className="mt-1 text-sm font-medium text-foreground">{tab.label}</div>
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
  variant = "bar",
  hideTabBar = false,
}: Props) {
  if (hideTabBar) {
    return (
      <div className={`min-w-0 ${className}`}>
        <div className="min-h-[200px] min-w-0 rounded-xl border border-primary/15 bg-card p-4 sm:p-5">
          {children}
        </div>
      </div>
    );
  }

  const useCards = variant === "cards";
  const tabsOnTop = tabPosition === "top" || useCards;

  const tabNav = useCards ? (
    <SheetTabCards tabs={tabs} activeId={activeId} onChange={onChange} />
  ) : (
    <TabBar tabs={tabs} activeId={activeId} onChange={onChange} edge={tabsOnTop ? "top" : "bottom"} />
  );

  const content = (
    <div
      className={[
        "min-h-[200px] min-w-0 border border-primary/15 bg-card p-4 sm:p-5",
        useCards
          ? "rounded-xl"
          : tabsOnTop
            ? "rounded-b-xl border-t-0"
            : "rounded-t-xl border-b-0",
      ].join(" ")}
    >
      {children}
    </div>
  );

  if (tabsOnTop) {
    return (
      <div className={`flex min-w-0 flex-col ${className}`}>
        {tabNav}
        {content}
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      {content}
      {tabNav}
    </div>
  );
}
