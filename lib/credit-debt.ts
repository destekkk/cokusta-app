import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";

/** Usta başına en fazla borç kredisi ile kullanılabilecek kontör */
export const MAX_CREDIT_DEBT = 10;

export function computeDebtSettlementAmount(debtCredits: number): number {
  return debtCredits * COKUSTA_CREDIT_PRICE;
}

export function canSubmitOffer(
  creditBalance: number,
  creditDebt: number,
  borcKredisiAktif = false
): boolean {
  if ((creditBalance ?? 0) >= 1) return true;
  if (!borcKredisiAktif) return false;
  return (creditDebt ?? 0) < MAX_CREDIT_DEBT;
}

/** Kontör bitmiş ve usta borç kredisi kullanmayı onaylamışsa teklif borçtan düşer */
export function willUseDebtCredit(
  creditBalance: number,
  creditDebt: number,
  borcKredisiAktif = false
): boolean {
  return (creditBalance ?? 0) < 1 && Boolean(borcKredisiAktif) && (creditDebt ?? 0) < MAX_CREDIT_DEBT;
}

export function canActivateBorcKredisi(
  creditBalance: number,
  creditDebt: number,
  borcKredisiAktif = false
): boolean {
  if (borcKredisiAktif) return false;
  if ((creditDebt ?? 0) > 0) return false;
  return (creditBalance ?? 0) < 1;
}

export function remainingDebtCapacity(creditDebt: number): number {
  return Math.max(0, MAX_CREDIT_DEBT - (creditDebt ?? 0));
}

export function computePlatformCheckoutTotal(packagePrice: number): {
  packageAmount: number;
  debtCredits: number;
  debtAmount: number;
  totalAmount: number;
} {
  return { packageAmount: packagePrice, debtCredits: 0, debtAmount: 0, totalAmount: packagePrice };
}

export function computeCheckoutTotal(packagePrice: number, creditDebt: number): {
  packageAmount: number;
  debtCredits: number;
  debtAmount: number;
  totalAmount: number;
} {
  const debtCredits = Math.max(0, creditDebt ?? 0);
  const debtAmount = computeDebtSettlementAmount(debtCredits);
  return {
    packageAmount: packagePrice,
    debtCredits,
    debtAmount,
    totalAmount: packagePrice + debtAmount,
  };
}
