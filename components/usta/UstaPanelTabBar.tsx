"use client";

import type { SheetTabItem } from "@/components/panel/SheetTabs";

type Props = {
  tabs: SheetTabItem[];
  activeId: string;
  onChange: (id: string) => void;
};

function formatCount(count: number | undefined): string {
  if (count === undefined || count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

/** Usta paneli — gönderdiğiniz yeşil sekme çubuğu stili */
export default function UstaPanelTabBar({ tabs, activeId, onChange }: Props) {
  return (
    <div
      className="overflow-x-auto rounded-xl bg-primary/10 p-1.5 sm:p-2"
      role="tablist"
      aria-label="Panel menüsü"
    >
      <div className="flex min-w-max gap-1 sm:min-w-0 sm:w-full">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          const count = formatCount(tab.count);
          const red = tab.redBorder;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={tab.lines ? `${tab.lines[0]} ${tab.lines[1]}` : tab.label}
              onClick={() => onChange(tab.id)}
              className={[
                "flex min-w-[5.5rem] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-center text-xs font-semibold transition sm:px-4 sm:py-3 sm:text-sm",
                active
                  ? red
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-primary text-white shadow-sm"
                  : red
                    ? "border-2 border-red-400 bg-white text-red-800 hover:bg-red-50"
                    : "bg-white text-secondary hover:bg-white/90 hover:text-primary",
              ].join(" ")}
            >
              {tab.lines ? (
                <span className="flex flex-col leading-tight">
                  <span>{tab.lines[0]}</span>
                  <span>{tab.lines[1]}</span>
                </span>
              ) : (
                <span>{tab.label}</span>
              )}
              {count ? (
                <span
                  className={[
                    "inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? "bg-white/25 text-white" : "bg-primary/15 text-primary",
                  ].join(" ")}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
