import Link from "next/link";
import type { LaunchCampaignStats } from "@/lib/campaigns";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";

type Props = {
  stats: LaunchCampaignStats;
};

export default function LaunchCampaignBanner({ stats }: Props) {
  if (!stats.provider.active && !stats.customer.active) return null;

  return (
    <section className="border-b border-border bg-accent/50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {stats.provider.active ? "3 Aylık Kampanya" : "Lansman Kampanyası"}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Çokusta&apos;ya katılın, avantajları kaçırmayın
          </h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {stats.provider.active && (
            <div className="border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Ustalar için
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-foreground">
                    {LAUNCH_CAMPAIGN.provider.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {LAUNCH_CAMPAIGN.provider.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-primary/15 px-3 py-2 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.provider.freeCredits}
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-primary/80">
                    kontör
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">
                  Bitiş: {stats.provider.endsAtLabel}
                  {stats.provider.daysRemaining > 0 && (
                    <span className="ml-2 text-primary">
                      ({stats.provider.daysRemaining} gün kaldı)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.provider.claimed} usta kampanyaya katıldı · Onay sonrası{" "}
                  <strong className="text-foreground">{stats.provider.freeCredits} kontör</strong>{" "}
                  otomatik yüklenir
                </p>
              </div>

              <Link
                href="/usta-ol"
                className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark sm:w-auto"
              >
                Usta olarak kayıt ol
              </Link>
            </div>
          )}

          {stats.customer.active && (
            <div className="border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    İlan verenler için
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {LAUNCH_CAMPAIGN.customer.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {LAUNCH_CAMPAIGN.customer.description}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{stats.customer.claimed} ilan oluşturuldu</span>
                  <span className="font-semibold text-secondary">
                    {stats.customer.remaining} kontenjan kaldı
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-secondary transition-all"
                    style={{
                      width: `${(stats.customer.claimed / stats.customer.maxSlots) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <Link
                href="/hizmetler"
                className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary-light sm:w-auto"
              >
                Ücretsiz teklif al
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
