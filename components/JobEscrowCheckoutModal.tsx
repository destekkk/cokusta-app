"use client";

import ParamGuvendePitch from "@/components/ParamGuvendePitch";
import OnlinePaymentsNotice from "@/components/OnlinePaymentsNotice";
import type { ParamGuvendeBreakdown } from "@/lib/param-guvende";
import { formatParamGuvendeFeeSummary } from "@/lib/param-guvende";

type Props = {
  serviceName: string;
  breakdown: ParamGuvendeBreakdown;
  onClose: () => void;
};

export default function JobEscrowCheckoutModal({
  serviceName,
  breakdown,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Param Güvende</h2>
            <p className="mt-1 text-sm text-muted-foreground">{serviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
          >
            Kapat
          </button>
        </div>

        <div className="mt-4 space-y-1 rounded-lg bg-muted/40 p-4 text-sm">
          <div className="flex justify-between">
            <span>İş bedeli</span>
            <span>{breakdown.jobAmount.toLocaleString("tr-TR")} ₺</span>
          </div>
          {breakdown.tiers.map((tier, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>Hizmet bedeli ({tier.label})</span>
              <span>{tier.fee.toLocaleString("tr-TR")} ₺</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Toplam</span>
            <span>{breakdown.totalAmount.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>

        <ParamGuvendePitch className="mt-4" />

        <p className="mt-3 text-xs text-muted-foreground">
          {formatParamGuvendeFeeSummary(breakdown)}
        </p>

        <OnlinePaymentsNotice variant="param-guvende" className="mt-4" />
      </div>
    </div>
  );
}
