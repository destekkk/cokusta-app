/** İç fiyatlandırma çarpanı (katalog × 0,50) */
export const PRICE_DISCOUNT_RATE = 0.5;
export const PRICE_MULTIPLIER = 1 - PRICE_DISCOUNT_RATE; // 0.5

export function cokustaPrice(catalogPrice: number): number {
  return Math.round(catalogPrice * PRICE_MULTIPLIER);
}

export const COKUSTA_COMMISSION_RATE = 0.13;

const platformServiceCatalog = [
  { slug: "premium-uyelik", name: "Premium Üyelik", catalogPrice: 459, unit: "ay" },
  {
    slug: "teklif-kontor-paketi",
    name: "Teklif Kontör Paketi (10 adet)",
    catalogPrice: 229,
    credits: 10,
    unit: "paket",
  },
  { slug: "one-cikarma", name: "Profil Öne Çıkarma", catalogPrice: 152, unit: "ay" },
  { slug: "dogrulanmis-rozet", name: "Doğrulanmış Rozet", catalogPrice: 75, unit: "yıl" },
] as const;

export const platformServicePricing = platformServiceCatalog.map((item) => ({
  ...item,
  price: cokustaPrice(item.catalogPrice),
}));

const SINGLE_CREDIT_CATALOG_PRICE = 35;
export const COKUSTA_CREDIT_PRICE = cokustaPrice(SINGLE_CREDIT_CATALOG_PRICE);

const creditPackCatalog = [
  {
    slug: "kontor-5",
    credits: 5,
    catalogPrice: 165,
    badge: "starter" as const,
    description: "Denemek isteyen ustalar için giriş paketi.",
  },
  {
    slug: "kontor-10",
    credits: 10,
    catalogPrice: 229,
    badge: "popular" as const,
    description: "Haftalık düzenli teklif veren ustalar için ideal.",
  },
  {
    slug: "kontor-25",
    credits: 25,
    catalogPrice: 499,
    badge: null,
    description: "Aktif ustalar için %28 toplu alım avantajı.",
  },
  {
    slug: "kontor-50",
    credits: 50,
    catalogPrice: 899,
    badge: "best-value" as const,
    description: "En düşük kontör maliyeti — yoğun dönemler için.",
  },
  {
    slug: "kontor-100",
    credits: 100,
    catalogPrice: 1599,
    badge: "pro" as const,
    description: "Tam zamanlı ustalar ve ekipler için pro paket.",
  },
] as const;

export const creditPackTiers = creditPackCatalog.map((tier) => ({
  ...tier,
  price: cokustaPrice(tier.catalogPrice),
  name: `${tier.credits} Kontör Paketi`,
  unit: "paket" as const,
}));

export function creditPerUnit(price: number, credits: number): number {
  return Math.round(price / credits);
}

export function savingsVsSingle(price: number, credits: number): number {
  const singleTotal = COKUSTA_CREDIT_PRICE * credits;
  return Math.max(0, Math.round((1 - price / singleTotal) * 100));
}

const serviceCatalogPrices: Record<string, number> = {
  "ev-temizligi": 1230,
  "evden-eve-nakliyat": 5385,
  "boya-badana": 3077,
  "mutfak-dolabi": 7692,
  "klima-montaj": 923,
  "matematik-ozel-ders": 615,
  "ofis-temizligi": 1846,
  "parke-laminat": 4615,
  "elektrik-tesisati": 769,
  "su-tesisati": 615,
  "dogalgaz-tesisati": 4615,
  "kalorifer-tesisati": 7692,
  "kombi-bakim": 900,
  "tikaniklik-acma": 700,
  "bahce-duzenleme": 2308,
  "ingilizce-ozel-ders": 692,
  "mobilya-montaj": 462,
  "sehir-ici-nakliyat": 1231,
  "banyo-yenileme": 18462,
  "fayans-seramik": 3846,
  "alcipan-asma-tavan": 4615,
  "duvar-alci-siva": 2769,
  "ev-komple-tadilat": 53846,
  "duvar-kagidi": 2308,
  "pencere-kapi-degisimi": 9231,
  "cam-balkon": 13846,
  "ic-mimari-danismanlik": 3077,
  "sehirlerarasi-nakliyat": 9231,
  "ofis-tasima": 6923,
  "parca-esya-tasima": 769,
  "asansorlu-tasima": 3846,
  "esya-depolama": 2308,
  "uluslararasi-tasimacilik": 27692,
  "ozel-esya-tasima": 3077,
  "kamyonet-tasimaciligi": 1538,
  "vip-tasima": 18462,
  "ev-aleti-servisi": 850,
  "bilgisayar-onarim": 615,
  "televizyon-onarim": 770,
  "telefon-tablet-servis": 540,
  "tadilat-sonrasi-temizlik": 2150,
  "koltuk-hali-yikama": 980,
  "bos-daire-temizligi": 1690,
  "aydinlatma-montaj": 420,
  "tv-duvar-montaj": 380,
  "surus-egitimi": 1230,
  "muzik-ozel-ders": 750,
  "cim-bicme": 620,
  "havuz-bakimi": 1540,
  "dis-cephe-boya": 6150,
};

export function getServiceStartingPrice(slug: string, fallback = 500): number {
  const catalog = serviceCatalogPrices[slug];
  return catalog !== undefined ? cokustaPrice(catalog) : fallback;
}

export const platformServices = platformServicePricing.map(({ slug, name, price }) => ({
  slug,
  name,
  price,
}));

export function getPlatformServiceName(slug: string): string {
  return platformServices.find((service) => service.slug === slug)?.name ?? slug;
}

export function getPlatformServicePrice(slug: string): number {
  return platformServices.find((service) => service.slug === slug)?.price ?? 0;
}

/** Eski slug uyumluluğu */
export function normalizePlatformServiceSlug(slug: string): string {
  return slug === "lead-paketi" ? "teklif-kontor-paketi" : slug;
}
