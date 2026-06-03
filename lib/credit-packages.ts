import {
  creditPackTiers,
  COKUSTA_CREDIT_PRICE,
  creditPerUnit,
  platformServicePricing,
  savingsVsSingle,
} from "@/lib/pricing";

export type CreditPackageBadge = "starter" | "popular" | "best-value" | "pro" | null;

export type ShopPackageKind = "credits" | "platform";

export type CreditPackage = {
  slug: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  badge: CreditPackageBadge;
  perCredit: number;
  savingsPercent: number;
  kind?: ShopPackageKind;
  unitLabel?: string;
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
    kind: "credits" as const,
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
    kind: "credits",
  },
];

const platformShopSlugs = ["one-cikarma", "dogrulanmis-rozet"] as const;

export const platformShopPackages: CreditPackage[] = platformServicePricing
  .filter((item) => platformShopSlugs.includes(item.slug as (typeof platformShopSlugs)[number]))
  .map((item) => ({
    slug: item.slug,
    name: item.name,
    credits: 0,
    price: item.price,
    description:
      item.slug === "one-cikarma"
        ? "Profiliniz arama ve listede üst sıralarda öne çıkar."
        : "Doğrulanmış rozet ile müşteri güvenini artırın.",
    badge: null,
    perCredit: 0,
    savingsPercent: 0,
    kind: "platform" as const,
    unitLabel: item.unit === "ay" ? "aylık" : item.unit === "yıl" ? "yıllık" : item.unit,
  }));

export function getShopPackage(slug: string): CreditPackage | undefined {
  return (
    creditPackages.find((pkg) => pkg.slug === slug) ??
    platformShopPackages.find((pkg) => pkg.slug === slug)
  );
}

export function getCreditPackage(slug: string): CreditPackage | undefined {
  const pkg = getShopPackage(slug);
  return pkg && (pkg.kind === "credits" || pkg.credits > 0) ? pkg : undefined;
}

export function isPlatformShopPackage(slug: string): boolean {
  return platformShopPackages.some((pkg) => pkg.slug === slug);
}

export function formatCreditPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} ₺`;
}
