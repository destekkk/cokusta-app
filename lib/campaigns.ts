/** Lansman kampanyası — merkezi sabitler */

export const LAUNCH_CAMPAIGN = {
  provider: {
    maxSlots: 500,
    /** Onay sonrası verilen ücretsiz teklif kontörü */
    freeCredits: 5,
    /** Sitede gösterilen başlangıç doluluk: 230 kayıtlı → 270 kontenjan kaldı */
    displayClaimedOffset: 230,
    title: "Bu ay ilk 500 ustaya 5 ücretsiz kontör",
    description:
      "Bu ay Çokusta'ya kayıt olan ilk 500 ustaya, onay sonrası 5 teklif kontörü hediye. 5 müşteriye ücretsiz teklif ver, platformu dene.",
  },
  customer: {
    maxSlots: 1000,
    /** Sitede gösterilen başlangıç: 670 ilan → 330 kontenjan kaldı */
    displayClaimedOffset: 670,
    title: "Bu ay ilk 1.000 ilana öncelikli eşleştirme",
    description:
      "Bu ay açılan ilk 1.000 ilan öncelikli olarak bölgenizdeki ustalara iletilir. 24 saat içinde teklif almayı hedefleyin — tamamen ücretsiz.",
  },
} as const;

export type LaunchCampaignStats = {
  provider: {
    /** Sitede gösterilen kayıt sayısı (offset dahil) */
    claimed: number;
    /** Sitede gösterilen kalan kontenjan */
    remaining: number;
    /** Gerçek kayıt sayısı (admin / arka plan) */
    actualClaimed: number;
    maxSlots: number;
    freeCredits: number;
    active: boolean;
  };
  customer: {
    claimed: number;
    remaining: number;
    actualClaimed: number;
    maxSlots: number;
    active: boolean;
  };
};

export function buildLaunchCampaignStats(
  providerClaimed: number,
  customerClaimed: number
): LaunchCampaignStats {
  const { provider, customer } = LAUNCH_CAMPAIGN;

  const displayClaimed = Math.min(
    provider.maxSlots,
    provider.displayClaimedOffset + providerClaimed
  );
  const displayRemaining = Math.max(0, provider.maxSlots - displayClaimed);

  const customerDisplayClaimed = Math.min(
    customer.maxSlots,
    customer.displayClaimedOffset + customerClaimed
  );
  const customerDisplayRemaining = Math.max(0, customer.maxSlots - customerDisplayClaimed);

  return {
    provider: {
      claimed: displayClaimed,
      remaining: displayRemaining,
      actualClaimed: providerClaimed,
      maxSlots: provider.maxSlots,
      freeCredits: provider.freeCredits,
      active: providerClaimed < provider.maxSlots,
    },
    customer: {
      claimed: customerDisplayClaimed,
      remaining: customerDisplayRemaining,
      actualClaimed: customerClaimed,
      maxSlots: customer.maxSlots,
      active: customerClaimed < customer.maxSlots,
    },
  };
}
