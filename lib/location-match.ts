/** Türkçe şehir adlarını karşılaştırmak için normalize eder */
export function normalizeCityName(city: string): string {
  return city
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

/** Usta ve talep şehirleri eşleşiyor mu */
export function citiesMatch(providerCity: string | undefined, quoteCity: string): boolean {
  const provider = normalizeCityName(providerCity ?? "");
  const quote = normalizeCityName(quoteCity);
  if (!provider) return true;
  if (!quote) return true;
  if (provider === quote) return true;
  return quote.includes(provider) || provider.includes(quote);
}

export function normalizeDistrictName(district: string): string {
  return normalizeCityName(district);
}

export function districtsMatch(a: string, b: string): boolean {
  return normalizeDistrictName(a) === normalizeDistrictName(b);
}
