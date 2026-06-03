/** Lansman / reklam kampanyaları — merkezi sabitler */

export const LAUNCH_CAMPAIGN = {
  provider: {
    /** Kampanya başlangıcı (kayıt tarihi bu aralıkta ise hediye geçerli) */
    startsAt: "2026-06-02T00:00:00+03:00",
    /** 3 ay — kampanya bitişi */
    endsAt: "2026-09-02T23:59:59+03:00",
    /** Onay sonrası verilen ücretsiz teklif kontörü */
    freeCredits: 10,
    title: "3 ay boyunca kayıt olan her ustaya 10 kontör hediye",
    description:
      "Kampanya süresince usta olarak kayıt olan ve hesabı onaylanan tüm ustalar 10 teklif kontörü kazanır. Kontör bitince uygun fiyatlı paketlerle devam edin.",
    /** Eski slot sayacı — artık sınırsız; istatistik için sayım devam eder */
    displayClaimedOffset: 0,
  },
  customer: {
    maxSlots: 1000,
    displayClaimedOffset: 670,
    title: "Bu ay ilk 1.000 ilana öncelikli eşleştirme",
    description:
      "Bu ay açılan ilk 1.000 ilan öncelikli olarak bölgenizdeki ustalara iletilir. 24 saat içinde teklif almayı hedefleyin — tamamen ücretsiz.",
  },
} as const;

export type LaunchCampaignStats = {
  provider: {
    claimed: number;
    actualClaimed: number;
    freeCredits: number;
    active: boolean;
    endsAtLabel: string;
    daysRemaining: number;
  };
  customer: {
    claimed: number;
    remaining: number;
    actualClaimed: number;
    maxSlots: number;
    active: boolean;
  };
};

function parseCampaignDate(iso: string): number {
  return new Date(iso).getTime();
}

export function isProviderSignupBonusActive(at = new Date()): boolean {
  const t = at.getTime();
  const { startsAt, endsAt } = LAUNCH_CAMPAIGN.provider;
  return t >= parseCampaignDate(startsAt) && t <= parseCampaignDate(endsAt);
}

/** Kayıt tarihi kampanya döneminde mi? */
export function isProviderSignupBonusEligible(createdAt: Date | string): boolean {
  const t = new Date(createdAt).getTime();
  const { startsAt, endsAt } = LAUNCH_CAMPAIGN.provider;
  return t >= parseCampaignDate(startsAt) && t <= parseCampaignDate(endsAt);
}

export function getProviderCampaignEndLabel(): string {
  return new Date(LAUNCH_CAMPAIGN.provider.endsAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getProviderCampaignDaysRemaining(at = new Date()): number {
  if (!isProviderSignupBonusActive(at)) return 0;
  const end = parseCampaignDate(LAUNCH_CAMPAIGN.provider.endsAt);
  const diff = end - at.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function buildLaunchCampaignStats(
  providerClaimed: number,
  customerClaimed: number
): LaunchCampaignStats {
  const { provider, customer } = LAUNCH_CAMPAIGN;

  const customerDisplayClaimed = Math.min(
    customer.maxSlots,
    customer.displayClaimedOffset + customerClaimed
  );
  const customerDisplayRemaining = Math.max(0, customer.maxSlots - customerDisplayClaimed);

  return {
    provider: {
      claimed: providerClaimed + provider.displayClaimedOffset,
      actualClaimed: providerClaimed,
      freeCredits: provider.freeCredits,
      active: isProviderSignupBonusActive(),
      endsAtLabel: getProviderCampaignEndLabel(),
      daysRemaining: getProviderCampaignDaysRemaining(),
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
