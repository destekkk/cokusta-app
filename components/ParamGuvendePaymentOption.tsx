"use client";

import type { ParamGuvendeBreakdown } from "@/lib/param-guvende";
import { formatParamGuvendeFeeSummary } from "@/lib/param-guvende";
import ParamGuvendePitch from "@/components/ParamGuvendePitch";

type Props = {
  offerId: string;
  providerName: string;
  breakdown: ParamGuvendeBreakdown;
  selected: boolean;
  disabled?: boolean;
  onSelect: (offerId: string) => void;
};

export default function ParamGuvendePaymentOption({
  offerId,
  providerName,
  breakdown,
  selected,
  disabled = false,
  onSelect,
}: Props) {
  return (
    <label
      className={`mt-3 block cursor-pointer rounded-lg border p-4 transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="param-guvende-offer"
          checked={selected}
          disabled={disabled}
          onChange={() => onSelect(offerId)}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Param Güvende ile öde</p>
          <p className="text-xs text-muted-foreground">{providerName} teklifi</p>

          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">İş bedeli</span>
              <span>{breakdown.jobAmount.toLocaleString("tr-TR")} ₺</span>
            </div>
            {breakdown.tiers.map((tier, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>
                  Hizmet bedeli — {tier.label}
                  <span className="block text-xs">
                    ({tier.baseAmount.toLocaleString("tr-TR")} ₺ × %{tier.rate * 100})
                  </span>
                </span>
                <span>{tier.fee.toLocaleString("tr-TR")} ₺</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
              <span>Toplam ödeme</span>
              <span>{breakdown.totalAmount.toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {formatParamGuvendeFeeSummary(breakdown)}
          </p>
          <ParamGuvendePitch compact className="mt-2" />
        </div>
      </div>
    </label>
  );
}
