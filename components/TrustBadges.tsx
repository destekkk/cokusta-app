import { BadgeCheck, CalendarClock, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const badges: { Icon: LucideIcon; title: string; sub: string }[] = [
  { Icon: BadgeCheck, title: "Sabit Fiyat", sub: "Garantisi" },
  { Icon: Users, title: "Uzman", sub: "Profesyoneller" },
  { Icon: ShieldCheck, title: "Güvenli Ödeme", sub: "Sistemi" },
  { Icon: CalendarClock, title: "Ertesi Gün", sub: "Hizmet İmkânı" },
];

export default function TrustBadges() {
  return (
    <section className="px-4 pt-2 pb-6 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          {badges.map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-4 py-3.5 sm:justify-center sm:px-5 sm:py-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-sm font-semibold text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
