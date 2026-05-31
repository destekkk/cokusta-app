import {
  creditPackTiers,
  COKUSTA_CREDIT_PRICE,
  creditPerUnit,
  savingsVsSingle,
} from "@/lib/pricing";

export type CreditPackageBadge = "starter" | "popular" | "best-value" | "pro" | null;

export type CreditPackage = {
  slug: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  badge: CreditPackageBadge;
  perCredit: number;
  savingsPercent: number;
};

const badgeLabels: Record<Exclude<CreditPackageBadge, null>, string> = {
  starter: "Başlangıç",
  popular: "En popüler",
  "best-value": "En avantajlı",
  pro: "Profesyonel",
};

export function getBadgeLabel(badge: CreditPackageBadge): string | null {
  return badge ? badgeLabels[badge] : null;
}

export const creditPackages: CreditPackage[] = [
  ...creditPackTiers.map((tier) => ({
    slug: tier.slug,
    name: tier.name,
    credits: tier.credits,
    price: tier.price,
    description: tier.description,
    badge: tier.badge,
    perCredit: creditPerUnit(tier.price, tier.credits),
    savingsPercent: savingsVsSingle(tier.price, tier.credits),
  })),
  {
    slug: "kontor-tek",
    name: "Tek Kontör",
    credits: 1,
    price: COKUSTA_CREDIT_PRICE,
    description: "Acil tek bir talebe teklif vermek için.",
    badge: null,
    perCredit: COKUSTA_CREDIT_PRICE,
    savingsPercent: 0,
  },
];

export function getCreditPackage(slug: string): CreditPackage | undefined {
  return creditPackages.find((pkg) => pkg.slug === slug);
}

export function formatCreditPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} ₺`;
}
