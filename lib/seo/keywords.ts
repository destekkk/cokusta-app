import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";

/** Rakip marka adı anahtar kelimelerde kullanılmaz */
const BLOCKED_KEYWORD = /\barmut\b/i;

function isAllowedKeyword(keyword: string): boolean {
  return !BLOCKED_KEYWORD.test(keyword);
}

/** Hizmet slug → Google'da aranan meslek / kısa kelimeler */
export const SERVICE_SEARCH_TERMS: Record<string, string[]> = {
  "ev-temizligi": ["temizlik", "temizlikçi", "ev temizliği", "temizlik firması", "ev temizlikçisi"],
  "ofis-temizligi": ["ofis temizliği", "temizlikçi", "işyeri temizliği", "ofis temizlik firması"],
  "tadilat-sonrasi-temizlik": ["tadilat sonrası temizlik", "inşaat sonrası temizlik", "temizlikçi"],
  "koltuk-hali-yikama": ["halı yıkama", "koltuk yıkama", "halı yıkamacı", "koltuk temizliği"],
  "bos-daire-temizligi": ["boş daire temizliği", "taşınma öncesi temizlik", "temizlikçi"],
  "evden-eve-nakliyat": ["nakliye", "nakliyeci", "evden eve nakliyat", "taşımacılık", "ev taşıma"],
  "sehir-ici-nakliyat": ["nakliye", "nakliyeci", "şehir içi nakliyat", "kamyonet", "eşya taşıma"],
  "sehirlerarasi-nakliyat": ["nakliye", "nakliyeci", "şehirlerarası nakliyat", "ev taşıma"],
  "ofis-tasima": ["ofis taşıma", "nakliyeci", "işyeri nakliyat", "ofis nakliyesi"],
  "parca-esya-tasima": ["parça eşya taşıma", "nakliyeci", "küçük nakliye", "kamyonet"],
  "asansorlu-tasima": ["asansörlü taşıma", "nakliyeci", "asansörlü nakliye"],
  "esya-depolama": ["eşya depolama", "depo", "nakliyeci", "eşya saklama"],
  "uluslararasi-tasimacilik": ["uluslararası taşımacılık", "nakliyeci", "yurtdışı nakliye"],
  "ozel-esya-tasima": ["özel eşya taşıma", "nakliyeci", "piyano taşıma", "antika taşıma"],
  "kamyonet-tasimaciligi": ["kamyonet", "kamyonet taşımacılığı", "nakliyeci", "minivan taşıma"],
  "vip-tasima": ["vip araç kiralama", "şoförlü transfer", "vip transfer", "lüks araç kiralama"],
  "boya-badana": ["boyacı", "boya badana", "boya ustası", "badana", "iç cephe boya"],
  "dis-cephe-boya": ["boyacı", "dış cephe boya", "cephe boyacısı", "mantolama boya"],
  "elektrik-tesisati": ["elektrikçi", "elektrik", "elektrik tesisatı", "elektrik ustası", "elektrik arıza"],
  "su-tesisati": ["tesisatçı", "su tesisatı", "tesisat ustası", "musluk tamiri", "su kaçağı"],
  "dogalgaz-tesisati": ["doğalgaz tesisatçısı", "doğalgaz", "gaz tesisatı", "doğalgaz ustası"],
  "kalorifer-tesisati": ["kalorifer tesisatçısı", "petek temizliği", "kalorifer", "petek montaj"],
  "kombi-bakim": ["kombi servisi", "kombi ustası", "kombi bakım", "kombi tamiri"],
  "tikaniklik-acma": ["tıkanıklık açma", "gider açma", "lavabo tıkanıklığı", "kanal açma"],
  "mutfak-dolabi": ["marangoz", "mutfak dolabı", "mobilya ustası", "mutfak dolabı yapımı"],
  "mobilya-montaj": ["mobilya montaj", "mobilya ustası", "marangoz", "ikea montaj"],
  "klima-montaj": ["klima servisi", "klima montaj", "klima ustası", "klima bakım"],
  "parke-laminat": ["parke ustası", "laminat parke", "parke döşeme", "parke montaj"],
  "fayans-seramik": ["fayans ustası", "seramik ustası", "fayansçı", "seramik döşeme"],
  "banyo-yenileme": ["banyo tadilat", "banyo ustası", "banyo yenileme", "banyo tadilatı"],
  "ev-komple-tadilat": ["tadilat", "tadilat ustası", "ev tadilat", "anahtar teslim tadilat"],
  "alcipan-asma-tavan": ["alcıpan ustası", "asma tavan", "alcı ustası", "tavan alçıpan"],
  "duvar-alci-siva": ["alçı ustası", "sıva ustası", "duvar sıva", "alçı sıva"],
  "duvar-kagidi": ["duvar kağıdı", "duvar kağıdı ustası", "wallpaper montaj"],
  "pencere-kapi-degisimi": ["pencere değişimi", "kapı montaj", "pvc pencere", "doğrama ustası"],
  "cam-balkon": ["cam balkon", "pvc cam balkon", "cam balkon ustası"],
  "ic-mimari-danismanlik": ["iç mimar", "iç mimari", "dekorasyon danışmanlığı"],
  "bahce-duzenleme": ["bahçıvan", "bahçe düzenleme", "peyzaj", "bahçe bakım"],
  "cim-bicme": ["çim biçme", "bahçıvan", "bahçe bakım", "çim bakımı"],
  "havuz-bakimi": ["havuz bakım", "havuz temizliği", "havuz ustası"],
  "ev-aleti-servisi": ["beyaz eşya servisi", "ev aleti tamiri", "beyaz eşya tamiri"],
  "bilgisayar-onarim": ["bilgisayar tamiri", "pc servisi", "laptop tamiri"],
  "televizyon-onarim": ["televizyon tamiri", "tv servisi", "tv tamiri"],
  "telefon-tablet-servis": ["telefon tamiri", "tablet servisi", "ekran değişimi"],
  "aydinlatma-montaj": ["avize montaj", "aydınlatma", "elektrikçi", "spot montaj"],
  "tv-duvar-montaj": ["tv montaj", "tv duvar montaj", "televizyon montaj"],
  "matematik-ozel-ders": ["matematik özel ders", "matematik öğretmeni", "özel ders"],
  "ingilizce-ozel-ders": ["ingilizce özel ders", "ingilizce öğretmeni", "özel ders"],
  "surus-egitimi": ["sürüş eğitimi", "direksiyon dersi", "ehliyet eğitimi"],
  "muzik-ozel-ders": ["müzik özel ders", "piyano dersi", "gitar dersi"],
};

/** Kategori slug → arama terimleri */
export const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  tadilat: ["tadilat", "tadilat ustası", "ev tadilat", "renovasyon"],
  nakliyat: ["nakliye", "nakliyeci", "evden eve nakliyat", "taşımacılık"],
  temizlik: ["temizlik", "temizlikçi", "ev temizliği", "temizlik firması"],
  boya: ["boyacı", "boya badana", "boya ustası", "badana"],
  elektrik: ["elektrikçi", "elektrik", "elektrik tesisatı", "elektrik ustası"],
  tesisat: ["tesisatçı", "su tesisatı", "doğalgaz tesisatı", "kombi servisi"],
  tamirat: ["tamirci", "servis", "beyaz eşya servisi", "onarım"],
  bahce: ["bahçıvan", "bahçe düzenleme", "peyzaj", "bahçe bakım"],
  "ozel-ders": ["özel ders", "öğretmen", "ders", "eğitmen"],
};

/** URL alias → gerçek hizmet slug */
export const SERVICE_SLUG_ALIASES: Record<string, string> = {
  elektrikci: "elektrik-tesisati",
  elektrik: "elektrik-tesisati",
  "elektrik-tesisat": "elektrik-tesisati",
  boyaci: "boya-badana",
  boya: "boya-badana",
  badana: "boya-badana",
  nakliye: "evden-eve-nakliyat",
  nakliyeci: "evden-eve-nakliyat",
  nakliyat: "evden-eve-nakliyat",
  tesisatci: "su-tesisati",
  tesisat: "su-tesisati",
  temizlikci: "ev-temizligi",
  temizlik: "ev-temizligi",
  marangoz: "mobilya-montaj",
  tadilatci: "ev-komple-tadilat",
  tadilat: "ev-komple-tadilat",
  usta: "ev-komple-tadilat",
  kombi: "kombi-bakim",
  klima: "klima-montaj",
  fayansci: "fayans-seramik",
  alci: "duvar-alci-siva",
  "ev-tasima": "evden-eve-nakliyat",
  "ev-temizlik": "ev-temizligi",
  "ofis-temizlik": "ofis-temizligi",
  "hali-yikama": "koltuk-hali-yikama",
  "beyaz-esya": "ev-aleti-servisi",
  bahcivan: "bahce-duzenleme",
  peyzaj: "bahce-duzenleme",
  "petek-temizligi": "kalorifer-tesisati",
  "gider-acma": "tikaniklik-acma",
  "cam-balkon-ustasi": "cam-balkon",
  "parke-ustasi": "parke-laminat",
  "mutfak-dolabi-ustasi": "mutfak-dolabi",
  "banyo-tadilat": "banyo-yenileme",
  "asma-tavan": "alcipan-asma-tavan",
  "ic-mimar": "ic-mimari-danismanlik",
  "ozel-ders": "matematik-ozel-ders",
  "matematik-ders": "matematik-ozel-ders",
  "ingilizce-ders": "ingilizce-ozel-ders",
  "pc-tamiri": "bilgisayar-onarim",
  "tv-tamiri": "televizyon-onarim",
  "telefon-tamiri": "telefon-tablet-servis",
  "avize-montaj": "aydinlatma-montaj",
  "kamyonet": "kamyonet-tasimaciligi",
  "asansorlu-nakliye": "asansorlu-tasima",
  "dis-cephe": "dis-cephe-boya",
  "dogalgaz": "dogalgaz-tesisati",
  "su-tesisat": "su-tesisati",
  "ev-tadilat": "ev-komple-tadilat",
  "mobilya-montaji": "mobilya-montaj",
  "klima-servisi": "klima-montaj",
  "kombi-servisi": "kombi-bakim",
  "seramik-ustasi": "fayans-seramik",
  "alcipan": "alcipan-asma-tavan",
  "hizmet": "ev-komple-tadilat",
  "ustalar": "ev-komple-tadilat",
};

export function getServiceSearchTerms(serviceSlug: string): string[] {
  const service = services.find((s) => s.slug === serviceSlug);
  const mapped = SERVICE_SEARCH_TERMS[serviceSlug] ?? [];
  const fromName = service ? [service.name.toLowerCase()] : [];
  return [...new Set([...mapped, ...fromName, serviceSlug.replace(/-/g, " ")])].filter(
    isAllowedKeyword
  );
}

export function getCategorySearchTerms(categorySlug: string): string[] {
  const cat = categories.find((c) => c.slug === categorySlug);
  const mapped = CATEGORY_SEARCH_TERMS[categorySlug] ?? [];
  const fromName = cat ? [cat.name.toLowerCase()] : [];
  return [...new Set([...mapped, ...fromName, categorySlug.replace(/-/g, " ")])].filter(
    isAllowedKeyword
  );
}

export function getPrimarySearchTerm(serviceSlug: string): string {
  const terms = getServiceSearchTerms(serviceSlug);
  return terms[0] ?? serviceSlug;
}

export function capitalizeTr(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
}

const GENERIC_SEO_TERMS = [
  "usta",
  "ustalar",
  "teklif al",
  "hizmet",
  "Çokusta",
  "cokusta",
  "en iyi usta",
  "güvenilir usta",
  "ücretsiz teklif",
  "fiyat karşılaştır",
  "doğrulanmış usta",
  "hizmet al",
  "profesyonel usta",
  "yakınımdaki usta",
  "hemen usta bul",
];

export function buildLocationSearchKeywords(input: {
  city: string;
  district?: string;
  neighborhood?: string;
  serviceSlug: string;
  serviceName: string;
  categorySlug?: string;
}): string[] {
  const { city, district, neighborhood, serviceSlug, serviceName, categorySlug } = input;
  const terms = getServiceSearchTerms(serviceSlug);
  const categoryTerms = categorySlug ? getCategorySearchTerms(categorySlug) : [];
  const locations: string[] = [city];
  if (district) locations.push(district);
  if (neighborhood) locations.push(neighborhood);

  const keywords = new Set<string>([
    ...GENERIC_SEO_TERMS,
    serviceName,
    serviceName.toLowerCase(),
    ...terms,
    ...categoryTerms,
    ...terms.map((t) => `${t} ustası`),
    ...terms.map((t) => `${t} fiyatları`),
    ...terms.map((t) => `${t} fiyat`),
    ...terms.map((t) => `ucuz ${t}`),
    ...terms.map((t) => `en iyi ${t}`),
  ]);

  for (const loc of locations) {
    keywords.add(loc);
    keywords.add(`${loc} usta`);
    keywords.add(`${loc} ustası`);
    keywords.add(`${loc} usta bul`);
    keywords.add(`${loc} hizmet`);
    for (const term of terms) {
      keywords.add(`${loc} ${term}`);
      keywords.add(`${loc} ${term} ustası`);
      keywords.add(`${loc} ${term} fiyatları`);
      keywords.add(`${loc} ${term} fiyat`);
      keywords.add(`${loc} ${term} hizmeti`);
      keywords.add(`${loc} en iyi ${term}`);
    }
    for (const catTerm of categoryTerms.slice(0, 4)) {
      keywords.add(`${loc} ${catTerm}`);
      keywords.add(`${loc} ${catTerm} ustası`);
    }
    if (district) {
      keywords.add(`${city} ${district} ${serviceName.toLowerCase()}`);
      keywords.add(`${city} ${district} usta`);
      for (const term of terms.slice(0, 6)) {
        keywords.add(`${city} ${district} ${term}`);
        keywords.add(`${city} ${district} ${term} ustası`);
      }
    }
    if (neighborhood && district) {
      const primary = terms[0] ?? serviceName.toLowerCase();
      keywords.add(`${district} ${neighborhood} ${primary}`);
      keywords.add(`${neighborhood} ${primary}`);
      keywords.add(`${neighborhood} ${primary} ustası`);
      keywords.add(`${city} ${district} ${neighborhood} usta`);
    }
  }

  return [...keywords].filter(isAllowedKeyword).slice(0, 80);
}

export function buildCategoryLocationKeywords(input: {
  city: string;
  district?: string;
  categorySlug: string;
  categoryName: string;
}): string[] {
  const { city, district, categorySlug, categoryName } = input;
  const terms = getCategorySearchTerms(categorySlug);
  const locations = district ? [city, district] : [city];

  const keywords = new Set<string>([
    ...GENERIC_SEO_TERMS,
    categoryName,
    categoryName.toLowerCase(),
    ...terms,
    ...terms.map((t) => `${t} ustası`),
    ...terms.map((t) => `${t} fiyatları`),
  ]);

  for (const loc of locations) {
    keywords.add(`${loc} ${categoryName.toLowerCase()}`);
    for (const term of terms) {
      keywords.add(`${loc} ${term}`);
      keywords.add(`${loc} ${term} ustası`);
      keywords.add(`${loc} ${term} fiyatları`);
    }
    if (district) {
      keywords.add(`${city} ${district} ${categoryName.toLowerCase()}`);
    }
  }

  return [...keywords].filter(isAllowedKeyword).slice(0, 60);
}

export function getAllServiceSlugAliases(): { alias: string; serviceSlug: string }[] {
  return Object.entries(SERVICE_SLUG_ALIASES).map(([alias, serviceSlug]) => ({
    alias,
    serviceSlug,
  }));
}
