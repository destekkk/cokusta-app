type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "amber" | "emerald";
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
};

export default function PanelStatCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
