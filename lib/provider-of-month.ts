/** Ayın ustası seçildiğinde yayın onayında verilen kontör hediyesi */
export const PROVIDER_OF_MONTH_CREDIT_REWARD = 30;

export type ProviderOfMonthStatus = "pending" | "published" | "removed";

export const providerOfMonthStatusLabels: Record<ProviderOfMonthStatus, string> = {
  pending: "Onay bekliyor",
  published: "Ana sayfada yayında",
  removed: "Yayından kaldırıldı",
};
