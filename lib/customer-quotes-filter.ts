export type CustomerQuoteTab = "waiting" | "offers" | "negotiating" | "finished";

export type CustomerQuotesListFilter = {
  limit?: number;
  offset?: number;
  tab?: CustomerQuoteTab;
  search?: string;
  /** Talep konumu — il */
  city?: string;
  /** Talep konumu — ilçe */
  district?: string;
};

/** Talep şehir/ilçe ile filtre eşleşmesi */
export function quoteMatchesLocationFilter(
  quote: { city: string; district?: string },
  filter?: Pick<CustomerQuotesListFilter, "city" | "district">
): boolean {
  const city = filter?.city?.trim();
  if (!city) return true;
  if (quote.city.trim().toLocaleLowerCase("tr-TR") !== city.toLocaleLowerCase("tr-TR")) {
    return false;
  }
  const district = filter?.district?.trim();
  if (!district) return true;
  return (quote.district ?? "").trim().toLocaleLowerCase("tr-TR") === district.toLocaleLowerCase("tr-TR");
}

export type CustomerQuoteTabCounts = {
  waiting: number;
  offers: number;
  negotiating: number;
  finished: number;
  total: number;
};
