/** Piyasa lideri referans fiyatları — Çokusta fiyatları Armut'un yarısı (×0,50) */
export const PRICE_DISCOUNT_RATE = 0.5;
export const PRICE_MULTIPLIER = 1 - PRICE_DISCOUNT_RATE; // 0.5

export function cokustaPrice(armutReferencePrice: number): number {
  return Math.round(armutReferencePrice * PRICE_MULTIPLIER);
}

/** Armut ortalama iş komisyonu referansı ~%20 */
export const ARmut_COMMISSION_RATE = 0.2;
export const COKUSTA_COMMISSION_RATE = 0.13;

export const platformServicePricing = [
  {
    slug: "premium-uyelik",
    name: "Premium Üyelik",
    armutPrice: 459,
    price: cokustaPrice(459),
    unit: "ay",
  },
  {
    slug: "teklif-kontor-paketi",
    name: "Teklif Kontör Paketi (10 adet)",
    armutPrice: 229,
    price: cokustaPrice(229),
    credits: 10,
    unit: "paket",
  },
  {
    slug: "one-cikarma",
    name: "Profil Öne Çıkarma",
    armutPrice: 152,
    price: cokustaPrice(152),
    unit: "ay",
  },
  {
    slug: "dogrulanmis-rozet",
    name: "Doğrulanmış Rozet",
    armutPrice: 75,
    price: cokustaPrice(75),
    unit: "yıl",
  },
] as const;

/** Tek teklif kontörü — Armut ortalama teklif bedeli referansı (~25–40 ₺, ort. 35 ₺) */
export const ARmut_CREDIT_PRICE = 35;
export const COKUSTA_CREDIT_PRICE = cokustaPrice(ARmut_CREDIT_PRICE);

/**
 * Armut bakiye / kontör paket referansları (piyasa ortalaması).
 * Çokusta fiyatları Armut referansının yarısı (×0,50).
 * Armut'ta teklif başı ücret dinamiktir; paketler toplu alım indirimi simüle eder.
 */
export const creditPackTiers = [
  {
    slug: "kontor-5",
    credits: 5,
    armutPrice: 165,
    badge: "starter" as const,
    description: "Denemek isteyen ustalar için giriş paketi.",
  },
  {
    slug: "kontor-10",
    credits: 10,
    armutPrice: 229,
    badge: "popular" as const,
    description: "Haftalık düzenli teklif veren ustalar için ideal.",
  },
  {
    slug: "kontor-25",
    credits: 25,
    armutPrice: 499,
    badge: null,
    description: "Aktif ustalar için %28 toplu alım avantajı.",
  },
  {
    slug: "kontor-50",
    credits: 50,
    armutPrice: 899,
    badge: "best-value" as const,
    description: "En düşük kontör maliyeti — yoğun dönemler için.",
  },
  {
    slug: "kontor-100",
    credits: 100,
    armutPrice: 1599,
    badge: "pro" as const,
    description: "Tam zamanlı ustalar ve ekipler için pro paket.",
  },
].map((tier) => ({
  ...tier,
  price: cokustaPrice(tier.armutPrice),
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

export const serviceStartingPrices: Record<string, { armut: number; cokusta: number }> = {
  "ev-temizligi": { armut: 1230, cokusta: cokustaPrice(1230) },
  "evden-eve-nakliyat": { armut: 5385, cokusta: cokustaPrice(5385) },
  "boya-badana": { armut: 3077, cokusta: cokustaPrice(3077) },
  "mutfak-dolabi": { armut: 7692, cokusta: cokustaPrice(7692) },
  "klima-montaj": { armut: 923, cokusta: cokustaPrice(923) },
  "matematik-ozel-ders": { armut: 615, cokusta: cokustaPrice(615) },
  "ofis-temizligi": { armut: 1846, cokusta: cokustaPrice(1846) },
  "parke-laminat": { armut: 4615, cokusta: cokustaPrice(4615) },
  "elektrik-tesisati": { armut: 769, cokusta: cokustaPrice(769) },
  "su-tesisati": { armut: 615, cokusta: cokustaPrice(615) },
  "dogalgaz-tesisati": { armut: 4615, cokusta: cokustaPrice(4615) },
  "kalorifer-tesisati": { armut: 7692, cokusta: cokustaPrice(7692) },
  "kombi-bakim": { armut: 900, cokusta: cokustaPrice(900) },
  "tikaniklik-acma": { armut: 700, cokusta: cokustaPrice(700) },
  "bahce-duzenleme": { armut: 2308, cokusta: cokustaPrice(2308) },
  "ingilizce-ozel-ders": { armut: 692, cokusta: cokustaPrice(692) },
  "mobilya-montaj": { armut: 462, cokusta: cokustaPrice(462) },
  "sehir-ici-nakliyat": { armut: 1231, cokusta: cokustaPrice(1231) },
  "banyo-yenileme": { armut: 18462, cokusta: cokustaPrice(18462) },
  "fayans-seramik": { armut: 3846, cokusta: cokustaPrice(3846) },
  "alcipan-asma-tavan": { armut: 4615, cokusta: cokustaPrice(4615) },
  "duvar-alci-siva": { armut: 2769, cokusta: cokustaPrice(2769) },
  "ev-komple-tadilat": { armut: 53846, cokusta: cokustaPrice(53846) },
  "duvar-kagidi": { armut: 2308, cokusta: cokustaPrice(2308) },
  "pencere-kapi-degisimi": { armut: 9231, cokusta: cokustaPrice(9231) },
  "cam-balkon": { armut: 13846, cokusta: cokustaPrice(13846) },
  "ic-mimari-danismanlik": { armut: 3077, cokusta: cokustaPrice(3077) },
  "sehirlerarasi-nakliyat": { armut: 9231, cokusta: cokustaPrice(9231) },
  "ofis-tasima": { armut: 6923, cokusta: cokustaPrice(6923) },
  "parca-esya-tasima": { armut: 769, cokusta: cokustaPrice(769) },
  "asansorlu-tasima": { armut: 3846, cokusta: cokustaPrice(3846) },
  "esya-depolama": { armut: 2308, cokusta: cokustaPrice(2308) },
  "uluslararasi-tasimacilik": { armut: 27692, cokusta: cokustaPrice(27692) },
  "ozel-esya-tasima": { armut: 3077, cokusta: cokustaPrice(3077) },
  "kamyonet-tasimaciligi": { armut: 1538, cokusta: cokustaPrice(1538) },
  "vip-tasima": { armut: 18462, cokusta: cokustaPrice(18462) },
  "ev-aleti-servisi": { armut: 850, cokusta: cokustaPrice(850) },
  "bilgisayar-onarim": { armut: 615, cokusta: cokustaPrice(615) },
  "televizyon-onarim": { armut: 770, cokusta: cokustaPrice(770) },
  "telefon-tablet-servis": { armut: 540, cokusta: cokustaPrice(540) },
  "tadilat-sonrasi-temizlik": { armut: 2150, cokusta: cokustaPrice(2150) },
  "koltuk-hali-yikama": { armut: 980, cokusta: cokustaPrice(980) },
  "bos-daire-temizligi": { armut: 1690, cokusta: cokustaPrice(1690) },
  "aydinlatma-montaj": { armut: 420, cokusta: cokustaPrice(420) },
  "tv-duvar-montaj": { armut: 380, cokusta: cokustaPrice(380) },
  "surus-egitimi": { armut: 1230, cokusta: cokustaPrice(1230) },
  "muzik-ozel-ders": { armut: 750, cokusta: cokustaPrice(750) },
  "cim-bicme": { armut: 620, cokusta: cokustaPrice(620) },
  "havuz-bakimi": { armut: 1540, cokusta: cokustaPrice(1540) },
  "dis-cephe-boya": { armut: 6150, cokusta: cokustaPrice(6150) },
};

export function getServiceStartingPrice(slug: string, fallback = 500): number {
  return serviceStartingPrices[slug]?.cokusta ?? fallback;
}

export function formatPriceCompare(armut: number, cokusta: number): string {
  return `${cokusta.toLocaleString("tr-TR")} ₺ (piyasa: ${armut.toLocaleString("tr-TR")} ₺)`;
}

export const platformServices = platformServicePricing.map(
  ({ slug, name, price, armutPrice }) => ({
    slug,
    name,
    price,
    armutPrice,
  })
);

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
