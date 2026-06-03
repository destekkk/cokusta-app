"use client";

import type { SheetTabItem } from "@/components/panel/SheetTabs";
import PanelTabLinesLabel from "@/components/panel/PanelTabLinesLabel";
import {
  panelTabBarRowClassName,
  panelTabBarTrackClassName,
  panelTabButtonClassName,
} from "@/lib/panel-tab-button";

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

/** Usta paneli — yeşil sekme çubuğu */
export default function UstaPanelTabBar({ tabs, activeId, onChange }: Props) {
  return (
    <div className={panelTabBarTrackClassName} role="tablist" aria-label="Panel menüsü">
      <div className={panelTabBarRowClassName}>
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
                panelTabButtonClassName({ active, redBorder: red }, "panel"),
                tab.lines ? "flex-col gap-0.5" : "",
              ].join(" ")}
            >
              {tab.lines ? (
                <PanelTabLinesLabel lines={tab.lines} count={count || undefined} active={active} />
              ) : (
                <>
                  <span>{tab.label}</span>
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
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
