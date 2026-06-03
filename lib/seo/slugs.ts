import { cities, districts, getDistricts } from "@/lib/data/cities";
import { getAllNeighborhoodParams, getNeighborhoods, hasNeighborhoodData } from "@/lib/data/neighborhoods";
import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { SERVICE_SLUG_ALIASES, getAllServiceSlugAliases } from "@/lib/seo/keywords";
import { toSlug } from "@/lib/seo/slug-utils";

export function findCityBySlug(slug: string): string | undefined {
  return cities.find((c) => toSlug(c) === slug);
}

export function findDistrictBySlug(city: string, slug: string): string | undefined {
  return getDistricts(city).find((d) => toSlug(d) === slug);
}

export function findServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function findCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function resolveServiceSlug(slugOrAlias: string): string | undefined {
  const normalized = slugOrAlias.toLowerCase();
  if (SERVICE_SLUG_ALIASES[normalized]) return SERVICE_SLUG_ALIASES[normalized];
  return services.find((s) => s.slug === normalized)?.slug;
}

export function findServiceBySlugOrAlias(slugOrAlias: string) {
  const resolved = resolveServiceSlug(slugOrAlias);
  return resolved ? findServiceBySlug(resolved) : undefined;
}

export function findNeighborhoodBySlug(city: string, district: string, slug: string): string | undefined {
  return getNeighborhoods(city, district).find((n) => toSlug(n) === slug);
}

export function getAllCitySlugs(): string[] {
  return cities.map(toSlug);
}

/** Yerel SEO öncelikli şehirler — build + footer */
export const TOP_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Kocaeli",
  "Sakarya",
  "Konya",
  "Gaziantep",
  "Mersin",
  "Kayseri",
  "Eskişehir",
  "Samsun",
  "Trabzon",
  "Muğla",
  "Adana",
  "Tekirdağ",
  "Manisa",
  "Balıkesir",
  "Aydın",
  "Denizli",
  "Hatay",
  "Malatya",
  "Diyarbakır",
  "Şanlıurfa",
  "Van",
  "Erzurum",
  "Ordu",
  "Kahramanmaraş",
  "Mardin",
  "Sivas",
  "Tokat",
  "Çanakkale",
  "Edirne",
  "Kırklareli",
  "Afyonkarahisar",
  "Kütahya",
  "Uşak",
  "Nevşehir",
  "Rize",
  "Giresun",
  "Düzce",
  "Yalova",
  "Bolu",
  "Zonguldak",
] as const;

/** Build sırasında önceden üretilecek şehirler (Vercel timeout önlemi) */
export const PREBUILD_CITIES = TOP_CITIES.slice(0, 8);

export function getTopCitySlugs(): string[] {
  return TOP_CITIES.map(toSlug);
}

export function getCityServiceParams() {
  return cities.flatMap((city) =>
    services.map((service) => ({
      city: toSlug(city),
      service: service.slug,
    }))
  );
}

export function getTopCityServiceParams() {
  return TOP_CITIES.flatMap((city) =>
    services.map((service) => ({
      city: toSlug(city),
      service: service.slug,
    }))
  );
}

export function getCityDistrictServiceParams() {
  const params: { city: string; district: string; service: string }[] = [];

  for (const city of cities) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      const districtSlug = toSlug(district);
      for (const service of services) {
        params.push({ city: citySlug, district: districtSlug, service: service.slug });
      }
    }
  }

  return params;
}

export function getTopCityDistrictServiceParams() {
  const params: { city: string; district: string; service: string }[] = [];
  for (const city of PREBUILD_CITIES) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      const districtSlug = toSlug(district);
      for (const service of services) {
        params.push({ city: citySlug, district: districtSlug, service: service.slug });
      }
    }
  }
  return params;
}

/** Build — sadece öncelikli şehirler */
export function getPrebuildCityServiceParams() {
  return PREBUILD_CITIES.flatMap((city) =>
    services.map((service) => ({
      city: toSlug(city),
      service: service.slug,
    }))
  );
}

export function getPrebuildCityCategoryParams() {
  return PREBUILD_CITIES.flatMap((city) =>
    categories.map((cat) => ({
      city: toSlug(city),
      category: cat.slug,
    }))
  );
}

export function getPrebuildDistrictHubParams() {
  const params: { city: string; district: string }[] = [];
  for (const city of PREBUILD_CITIES) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      params.push({ city: citySlug, district: toSlug(district) });
    }
  }
  return params;
}

export function getDistrictHubParams() {
  const params: { city: string; district: string }[] = [];
  for (const city of cities) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      params.push({ city: citySlug, district: toSlug(district) });
    }
  }
  return params;
}

export function getTopDistrictHubParams() {
  const params: { city: string; district: string }[] = [];
  for (const city of TOP_CITIES) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      params.push({ city: citySlug, district: toSlug(district) });
    }
  }
  return params;
}

export function getCityCategoryParams() {
  return cities.flatMap((city) =>
    categories.map((cat) => ({
      city: toSlug(city),
      category: cat.slug,
    }))
  );
}

export function getTopCityCategoryParams() {
  return TOP_CITIES.flatMap((city) =>
    categories.map((cat) => ({
      city: toSlug(city),
      category: cat.slug,
    }))
  );
}

export function districtServicePath(citySlug: string, districtSlug: string, serviceSlug: string) {
  return `/lokasyon/${citySlug}/ilce/${districtSlug}/${serviceSlug}`;
}

export function districtPath(citySlug: string, districtSlug: string) {
  return `/lokasyon/${citySlug}/ilce/${districtSlug}`;
}

export function cityServicePath(citySlug: string, serviceSlug: string) {
  return `/lokasyon/${citySlug}/${serviceSlug}`;
}

export function cityPath(citySlug: string) {
  return `/lokasyon/${citySlug}`;
}

export function cityCategoryPath(citySlug: string, categorySlug: string) {
  return `/lokasyon/${citySlug}/kategori/${categorySlug}`;
}

export function neighborhoodServicePath(
  citySlug: string,
  districtSlug: string,
  neighborhoodSlug: string,
  serviceSlug: string
) {
  return `/lokasyon/${citySlug}/ilce/${districtSlug}/mahalle/${neighborhoodSlug}/${serviceSlug}`;
}

/** Mahalle sayfaları — popüler + sık aranan hizmetler */
const NEIGHBORHOOD_SERVICE_SLUGS = [
  "elektrik-tesisati",
  "boya-badana",
  "evden-eve-nakliyat",
  "ev-temizligi",
  "su-tesisati",
  "ev-komple-tadilat",
  "kombi-bakim",
  "mobilya-montaj",
  "klima-montaj",
  "fayans-seramik",
  "mutfak-dolabi",
  "koltuk-hali-yikama",
  "dogalgaz-tesisati",
  "tikaniklik-acma",
  "dis-cephe-boya",
  "parke-laminat",
  "banyo-yenileme",
  "alcipan-asma-tavan",
  "sehir-ici-nakliyat",
  "ev-aleti-servisi",
  "oto-tamir",
  "tekne-tamiri",
];

export function getNeighborhoodServiceParams() {
  const params: {
    city: string;
    district: string;
    neighborhood: string;
    service: string;
  }[] = [];

  for (const { city, district, neighborhood } of getAllNeighborhoodParams()) {
    const citySlug = toSlug(city);
    const districtSlug = toSlug(district);
    const neighborhoodSlug = toSlug(neighborhood);
    for (const slug of NEIGHBORHOOD_SERVICE_SLUGS) {
      params.push({
        city: citySlug,
        district: districtSlug,
        neighborhood: neighborhoodSlug,
        service: slug,
      });
    }
  }
  return params;
}

/** Build — mahalle sayfalarında popüler 8 hizmet */
const PREBUILD_NEIGHBORHOOD_SERVICES = NEIGHBORHOOD_SERVICE_SLUGS.slice(0, 8);

export function getPrebuildNeighborhoodServiceParams() {
  const params: {
    city: string;
    district: string;
    neighborhood: string;
    service: string;
  }[] = [];

  for (const { city, district, neighborhood } of getAllNeighborhoodParams()) {
    const citySlug = toSlug(city);
    const districtSlug = toSlug(district);
    const neighborhoodSlug = toSlug(neighborhood);
    for (const slug of PREBUILD_NEIGHBORHOOD_SERVICES) {
      params.push({
        city: citySlug,
        district: districtSlug,
        neighborhood: neighborhoodSlug,
        service: slug,
      });
    }
  }
  return params;
}

export function getCityServiceAliasParams() {
  const params: { city: string; service: string }[] = [];
  for (const city of cities) {
    const citySlug = toSlug(city);
    for (const { alias } of getAllServiceSlugAliases()) {
      params.push({ city: citySlug, service: alias });
    }
  }
  return params;
}

export function getDistrictServiceAliasParams() {
  const params: { city: string; district: string; service: string }[] = [];
  const aliases = getAllServiceSlugAliases();
  for (const city of cities) {
    const citySlug = toSlug(city);
    for (const district of getDistricts(city)) {
      const districtSlug = toSlug(district);
      for (const { alias } of aliases) {
        params.push({ city: citySlug, district: districtSlug, service: alias });
      }
    }
  }
  return params;
}

export function getCitiesWithDistricts(): string[] {
  return [...cities];
}

export { toSlug } from "@/lib/seo/slug-utils";
export { cities, categories, services, districts, getDistricts, getNeighborhoods, hasNeighborhoodData };
