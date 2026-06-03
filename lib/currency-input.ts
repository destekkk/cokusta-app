/** TL tutar girişi: en fazla 5 rakam, binlik ayraç nokta (12.345) */

export const TL_AMOUNT_MAX_DIGITS = 5;

export function digitsFromTlInput(value: string, maxDigits = TL_AMOUNT_MAX_DIGITS): string {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

export function formatTlDigits(digits: string, maxDigits = TL_AMOUNT_MAX_DIGITS): string {
  const clean = digitsFromTlInput(digits, maxDigits);
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseTlDigits(digits: string): number {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return 0;
  return parseInt(clean, 10);
}
