export type CustomerQuoteTab = "waiting" | "offers";

export type CustomerQuotesListFilter = {
  limit?: number;
  offset?: number;
  tab?: CustomerQuoteTab;
  search?: string;
};

export type CustomerQuoteTabCounts = {
  waiting: number;
  offers: number;
  total: number;
};

export function tabForQuoteInput(input: {
  status: string;
  offerCount: number;
}): CustomerQuoteTab {
  if (input.offerCount > 0) return "offers";
  if (input.status === "accepted" || input.status === "completed" || input.status === "cancelled") {
    return "offers";
  }
  return "waiting";
}
