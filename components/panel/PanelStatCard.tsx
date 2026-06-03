type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "amber" | "emerald";
  active?: boolean;
  onClick?: () => void;
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
};

export default function PanelStatCard({
  label,
  value,
  hint,
  tone = "default",
  active = false,
  onClick,
}: Props) {
  const className = [
    "w-full rounded-xl border bg-card p-4 text-left transition",
    onClick ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5" : "",
    active
      ? "border-primary bg-primary/10 ring-2 ring-primary/35 shadow-sm"
      : "border-border",
  ].join(" ");

  const inner = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-pressed={active}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}
