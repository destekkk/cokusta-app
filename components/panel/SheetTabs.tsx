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
        "flex items-end gap-0 overflow-x-auto border-border bg-[#d4d4d4] px-0.5 dark:bg-muted/50",
        edge === "top" ? "border-b pt-1" : "border-t pb-0.5",
      ].join(" ")}
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
              "relative shrink-0 border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm",
              edge === "bottom" ? "rounded-t-md" : "rounded-t-md",
              active
                ? "z-10 border-border border-b-card bg-card text-foreground shadow-[0_1px_0_0_hsl(var(--card))]"
                : "border-transparent bg-[#e8e8e8] text-muted-foreground hover:bg-[#f5f5f5] hover:text-foreground dark:bg-muted/70",
            ].join(" ")}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-1 tabular-nums ${active ? "text-muted-foreground" : "text-muted-foreground/80"}`}
              >
                ({tab.count > 99 ? "99+" : tab.count})
              </span>
            )}
          </button>
        );
      })}
      {edge === "bottom" && <div className="min-w-[24px] flex-1" aria-hidden />}
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
        "min-h-[200px] border border-border bg-card p-4 sm:p-5",
        tabPosition === "bottom" ? "rounded-t-lg border-b-0" : "rounded-b-lg border-t-0",
      ].join(" ")}
    >
      {children}
    </div>
  );

  if (tabPosition === "top") {
    return (
      <div className={`flex flex-col ${className}`}>
        <TabBar tabs={tabs} activeId={activeId} onChange={onChange} edge="top" />
        {content}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {content}
      <TabBar tabs={tabs} activeId={activeId} onChange={onChange} edge="bottom" />
    </div>
  );
}
