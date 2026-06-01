import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";

/** Usta nakit ödeme talebinde kesilen platform komisyonu */
export const PAYOUT_FEE_RATE = 0.03;

/** Minimum nakit ödeme talebi (kontör) */
export const MIN_PAYOUT_CREDITS = 5;

export function creditsToTl(credits: number): number {
  return credits * COKUSTA_CREDIT_PRICE;
}

export function tlToCredits(tlAmount: number): number {
  return Math.max(1, Math.ceil(tlAmount / COKUSTA_CREDIT_PRICE));
}

export function computePayoutAmounts(credits: number): {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
} {
  const grossAmount = creditsToTl(credits);
  const feeAmount = Math.round(grossAmount * PAYOUT_FEE_RATE);
  const netAmount = grossAmount - feeAmount;
  return { grossAmount, feeAmount, netAmount };
}

export function currentCreditPeriod(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
