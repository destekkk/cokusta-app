export type CustomerQuoteTab = "waiting" | "offers" | "negotiating" | "finished";

export type CustomerQuotesListFilter = {
  limit?: number;
  offset?: number;
  tab?: CustomerQuoteTab;
  search?: string;
};

export type CustomerQuoteTabCounts = {
  waiting: number;
  offers: number;
  negotiating: number;
  finished: number;
  total: number;
};
