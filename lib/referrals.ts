/** Arkadaşını getir — davet eden ustaya verilen kontör */
export const REFERRAL_REWARD_CREDITS = 5;

export const REFERRAL_CAMPAIGN = {
  title: "Arkadaşını getir, 5 kontör kazan",
  description:
    "Usta olmasını istediğiniz arkadaşınızın telefon numarasını girin. Numarayı kaydettiğimizde hesabınıza 5 teklif kontörü tanımlanır.",
  rewardCredits: REFERRAL_REWARD_CREDITS,
} as const;

export function maskReferralPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  const last4 = digits.slice(-4);
  return `••• ••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
}
