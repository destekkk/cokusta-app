/** Usta paneli sekme çubuğu + üst menü — aynı buton görünümü */

export type PanelTabButtonOpts = {
  active?: boolean;
  redBorder?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-center text-xs font-semibold transition sm:text-sm";

export function panelTabButtonClassName(
  { active, redBorder }: PanelTabButtonOpts,
  size: "panel" | "header" = "panel"
): string {
  const pad =
    size === "panel"
      ? "min-w-[5.5rem] flex-1 px-2 py-2.5 sm:px-4 sm:py-3"
      : "shrink-0 px-2.5 py-2 sm:px-3 sm:py-2.5";

  const red = Boolean(redBorder);
  const state = active
    ? red
      ? "bg-red-600 text-white shadow-sm"
      : "bg-primary text-white shadow-sm"
    : red
      ? "border-2 border-red-400 bg-white text-red-800 hover:bg-red-50"
      : "bg-white text-secondary hover:bg-white/90 hover:text-primary";

  return [base, pad, state].join(" ");
}

export const panelTabBarTrackClassName =
  "overflow-x-auto rounded-xl bg-primary/10 p-1.5 sm:p-2";

export const panelTabBarRowClassName = "flex min-w-max gap-1 sm:min-w-0 sm:w-full";
