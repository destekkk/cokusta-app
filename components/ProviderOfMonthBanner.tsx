import Link from "next/link";
import type { ProviderOfTheMonth, ProviderSummary } from "@/lib/types";
import type { ProviderCertificate } from "@/lib/types";

type Props = {
  selection: ProviderOfTheMonth & {
    certificate?: ProviderCertificate;
    provider?: ProviderSummary;
  };
};

export default function ProviderOfMonthBanner({ selection }: Props) {
  const { provider, certificate } = selection;

  return (
    <section className="border-b border-border bg-gradient-to-r from-secondary via-secondary to-secondary/95 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-light">
            <span aria-hidden>⛓</span>
            Blockchain Sertifikalı
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            {selection.periodLabel} Ayın Ustası
          </h2>
          <p className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            {selection.providerName}
          </p>
          {provider && (
            <p className="mt-2 text-white/70">
              {provider.city}
              {provider.completedJobs > 0 && (
                <> · {provider.completedJobs} tamamlanan iş</>
              )}
            </p>
          )}
          {selection.reason && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
              {selection.reason}
            </p>
          )}
          {certificate && (
            <Link
              href={`/sertifika/${certificate.id}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Sertifikayı doğrula
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <div className="w-full max-w-sm shrink-0 rounded-2xl border border-primary/30 bg-card p-6 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-4xl">
              🏆
            </div>
            <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
              Ayın Ustası
            </div>
            <div className="mt-1 font-bold text-foreground">{selection.providerName}</div>
            {certificate && (
              <div className="mt-3 font-mono text-[10px] text-muted-foreground break-all">
                {certificate.blockHash.slice(0, 32)}…
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
