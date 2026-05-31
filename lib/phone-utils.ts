/** Türkiye cep telefonu — baştaki 0 olmadan da kabul edilir (532… → 0532…) */
export function normalizeProviderPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    digits = `0${digits}`;
  }

  return digits;
}

export function isValidProviderPhone(phone: string): boolean {
  return /^05\d{9}$/.test(normalizeProviderPhone(phone));
}
