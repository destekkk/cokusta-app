export type CustomerQuoteTab = "waiting" | "offers" | "finished";

export type CustomerQuotesListFilter = {
  limit?: number;
  offset?: number;
  tab?: CustomerQuoteTab;
  search?: string;
};

export type CustomerQuoteTabCounts = {
  waiting: number;
  offers: number;
  finished: number;
  total: number;
};

export function tabForQuoteInput(input: {
  status: string;
  offerCount: number;
}): CustomerQuoteTab {
  if (input.status === "accepted" || input.status === "completed" || input.status === "cancelled") {
    return "finished";
  }
  if (input.offerCount > 0) return "offers";
  return "waiting";
}
