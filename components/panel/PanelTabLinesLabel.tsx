/** Sekme / menü: 1. satır Benim, 2. satır Tekliflerim */
export default function PanelTabLinesLabel({
  lines,
  count,
  active,
}: {
  lines: [string, string];
  count?: string;
  active?: boolean;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex flex-col leading-tight text-center">
        <span className="block whitespace-normal">{lines[0]}</span>
        <span className="block whitespace-normal">{lines[1]}</span>
      </span>
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
    </span>
  );
}
