import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";

/** Arkadaşını getir — davet eden ustaya verilen kontör */
export const REFERRAL_REWARD_CREDITS = 5;

export const REFERRAL_CAMPAIGN = {
  title: "Arkadaşını getir, 5 kontör kazan",
  description:
    "Davet etmek istediğiniz ustanın adını, telefonunu ve yaptığı işi (kategori / hizmet) girin. Kayıt sonrası hesabınıza 5 teklif kontörü tanımlanır.",
  rewardCredits: REFERRAL_REWARD_CREDITS,
} as const;

export type ProviderReferralSubmitInput = {
  phone: string;
  name: string;
  categorySlug: string;
  serviceSlugs: string[];
};

export function maskReferralPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  const last4 = digits.slice(-4);
  return `••• ••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
}

export function validateReferralInput(input: ProviderReferralSubmitInput): string | null {
  const name = input.name.trim();
  if (name.length < 3) return "Ad soyad en az 3 karakter olmalı.";

  const category = categories.find((c) => c.slug === input.categorySlug);
  if (!category) return "Geçerli bir kategori seçin.";

  const slugs = [...new Set(input.serviceSlugs.filter(Boolean))];
  if (slugs.length === 0) return "En az bir hizmet seçin.";

  const validSlugs = services
    .filter((s) => s.categorySlug === input.categorySlug)
    .map((s) => s.slug);
  if (!slugs.every((slug) => validSlugs.includes(slug))) {
    return "Seçilen hizmetler kategoriyle uyuşmuyor.";
  }

  return null;
}
