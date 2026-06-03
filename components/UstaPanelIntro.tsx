import BorcKredisiAlert from "@/components/BorcKredisiAlert";
import PanelBackButton from "@/components/panel/PanelBackButton";
import UstaKontorYukleLink from "@/components/UstaKontorYukleLink";

type Props = {
  title?: string;
  subtitle?: string;
  creditBalance?: number;
  creditDebt?: number;
  escrowBalanceTl?: number;
  showKontorYukle?: boolean;
  kontorHref?: string;
  backHref?: string;
  backLabel?: string;
  /** Usta paneli kartının altında (ör. sekme menüsü) */
  belowPanel?: React.ReactNode;
};

export default function UstaPanelIntro({
  title = "Usta Paneli",
  subtitle = "Açık taleplere teklif verin, pazarlık yapın ve kazancınızı yönetin.",
  creditBalance,
  creditDebt = 0,
  escrowBalanceTl = 0,
  showKontorYukle = true,
  kontorHref,
  backHref,
  backLabel = "Tekliflere dön",
  belowPanel,
}: Props) {
  const showStats = creditBalance !== undefined;

  return (
    <div className="space-y-4">
      {backHref ? (
        <PanelBackButton href={backHref} label={backLabel.replace(/^←\s*/, "")} />
      ) : null}

      {creditDebt > 0 ? <BorcKredisiAlert creditDebt={creditDebt} /> : null}

      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
          ) : null}

          {showStats && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                Kontör: {creditBalance}
              </span>
              {creditDebt > 0 && (
                <span className="inline-flex items-center rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-950">
                  Borç kredisi: {creditDebt}
                </span>
              )}
              {escrowBalanceTl > 0 && (
                <span className="inline-flex items-center rounded-lg border border-emerald-300/50 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900">
                  Güvence: {escrowBalanceTl.toLocaleString("tr-TR")} ₺
                </span>
              )}
            </div>
          )}
        </div>

        {showKontorYukle ? (
          <UstaKontorYukleLink
            href={kontorHref}
            className="w-full shrink-0 sm:w-auto lg:min-w-[220px]"
          />
        ) : null}
      </div>
      </div>

      {belowPanel ? <div className="min-w-0">{belowPanel}</div> : null}
    </div>
  );
}
