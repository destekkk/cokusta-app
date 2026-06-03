/** Kullanıcının yüklediği görseller */
export const serviceImages: Record<string, string> = {
  "ev-temizligi": "/images/services/ev-temizligi.png",
  "evden-eve-nakliyat": "/images/services/evden-eve-nakliyat.png",
  "boya-badana": "/images/services/boya-badana.png",
  "mutfak-dolabi": "/images/services/mutfak-dolabi.png",
  "klima-montaj": "/images/services/klima-montaj.png",
  "matematik-ozel-ders": "/images/services/matematik-ozel-ders.png",
  "ofis-temizligi": "/images/services/ofis-temizligi.png",
  "parke-laminat": "/images/services/parke-laminat.png",
  "elektrik-tesisati": "/images/services/elektrik-tesisati.png",
  "su-tesisati": "/images/services/su-tesisati.png",
  "bahce-duzenleme": "/images/services/bahce-duzenleme.png",
  "ingilizce-ozel-ders": "/images/services/ingilizce-ozel-ders.png",
  "mobilya-montaj": "/images/services/mobilya-montaj.png",
  "sehir-ici-nakliyat": "/images/services/sehir-ici-nakliyat.png",
  "banyo-yenileme": "/images/services/banyo-yenileme.png",
  "fayans-seramik": "/images/services/fayans-seramik.png",
  "alcipan-asma-tavan": "/images/services/alcipan-asma-tavan.png",
  "duvar-alci-siva": "/images/services/duvar-alci-siva.png",
  "ev-komple-tadilat": "/images/services/ev-komple-tadilat.png",
  "duvar-kagidi": "/images/services/duvar-kagidi.png",
  "pencere-kapi-degisimi": "/images/services/pencere-kapi-degisimi.jpg",
  "cam-balkon": "/images/services/cam-balkon.jpg",
  "ic-mimari-danismanlik": "/images/services/ic-mimari-danismanlik.png",
  "sehirlerarasi-nakliyat": "/images/services/sehirlerarasi-nakliyat.png",
  "ofis-tasima": "/images/services/ofis-tasima.png",
  "parca-esya-tasima": "/images/services/parca-esya-tasima.png",
  "asansorlu-tasima": "/images/services/asansorlu-tasima.png",
  "esya-depolama": "/images/services/esya-depolama.png",
  "uluslararasi-tasimacilik": "/images/services/uluslararasi-tasimacilik.jpg",
  "ozel-esya-tasima": "/images/services/ozel-esya-tasima.png",
  "kamyonet-tasimaciligi": "/images/services/kamyonet-tasimaciligi.png",
  "vip-tasima": "/images/services/vip-tasima.png",
  "dogalgaz-tesisati": "/images/services/dogalgaz-tesisati.png",
  "kalorifer-tesisati": "/images/services/kalorifer-tesisati.png",
  "kombi-bakim": "/images/services/kombi-bakim.png",
  "tikaniklik-acma": "/images/services/tikaniklik-acma.png",
  "ev-aleti-servisi": "/images/services/ev-aleti-servisi.jpg",
  "bilgisayar-onarim": "/images/services/bilgisayar-onarim.png",
  "televizyon-onarim": "/images/services/televizyon-onarim.png",
  "telefon-tablet-servis": "/images/services/telefon-tablet-servis.png",
  "tadilat-sonrasi-temizlik": "/images/services/tadilat-sonrasi-temizlik.png",
  "koltuk-hali-yikama": "/images/services/koltuk-hali-yikama.png",
  "bos-daire-temizligi": "/images/services/bos-daire-temizligi.png",
  "aydinlatma-montaj": "/images/services/aydinlatma-montaj.png",
  "tv-duvar-montaj": "/images/services/tv-duvar-montaj.png",
  "surus-egitimi": "/images/services/surus-egitimi.png",
  "muzik-ozel-ders": "/images/services/muzik-ozel-ders.png",
  "cim-bicme": "/images/services/cim-bicme.png",
  "havuz-bakimi": "/images/services/havuz-bakimi.png",
  "dis-cephe-boya": "/images/services/dis-cephe-boya.png",
  "oto-tamir": "/images/services/oto-tamir.png",
  "tekne-tamiri": "/images/services/tekne-tamiri.png",
};

/** Kategori vitrin hizmeti — özel görseli olmayan hizmetler bunu kullanır */
const categoryCoverService: Record<string, string> = {
  tadilat: "mutfak-dolabi",
  nakliyat: "evden-eve-nakliyat",
  temizlik: "ev-temizligi",
  boya: "boya-badana",
  elektrik: "elektrik-tesisati",
  tesisat: "su-tesisati",
  tamirat: "oto-tamir",
  bahce: "bahce-duzenleme",
  "ozel-ders": "ingilizce-ozel-ders",
};

export function hasCustomServiceImage(slug: string): boolean {
  return slug in serviceImages;
}

function getDirectServiceImage(slug: string): string | null {
  return serviceImages[slug] ?? null;
}

/** Önce hizmetin kendi görseli, yoksa kategorinin vitrin görseli */
export function getServiceImage(slug: string, categorySlug?: string): string | null {
  const own = getDirectServiceImage(slug);
  if (own) return own;

  if (categorySlug) {
    const coverSlug = categoryCoverService[categorySlug];
    if (coverSlug) return getDirectServiceImage(coverSlug);
  }

  return null;
}

export function getCategoryImage(slug: string): string | null {
  const coverService = categoryCoverService[slug];
  if (coverService) return getDirectServiceImage(coverService);
  return null;
}
