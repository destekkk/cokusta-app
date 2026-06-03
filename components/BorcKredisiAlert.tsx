import { formatCreditPrice } from "@/lib/credit-packages";
import { computeDebtSettlementAmount } from "@/lib/credit-debt";

type Props = {
  creditDebt: number;
  className?: string;
};

/** Borç kredisi varken paket alımında tahsilat uyarısı */
export default function BorcKredisiAlert({ creditDebt, className = "" }: Props) {
  if (creditDebt <= 0) return null;

  const debtAmount = formatCreditPrice(computeDebtSettlementAmount(creditDebt));

  return (
    <div
      role="alert"
      className={`debt-alert-blink rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`.trim()}
    >
      <p className="font-semibold leading-relaxed">
        <span className="debt-alert-blink-text">Borç krediniz var.</span> Paket satın alırken{" "}
        <strong>{debtAmount}</strong> tutarındaki borç kredisi paket fiyatına eklenerek tahsil
        edilecektir.
      </p>
    </div>
  );
}
