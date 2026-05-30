import { cities, districts, getDistricts } from "@/lib/data/cities";
import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i", i: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function toSlug(text: string): string {
  return text
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCityBySlug(slug: string): string | undefined {
  return cities.find((c) => toSlug(c) === slug);
}

export function findDistrictBySlug(city: string, slug: string): string | undefined {
  return getDistricts(city).find((d) => toSlug(d) === slug);
}

export function findServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return cities.map(toSlug);
}

export const TOP_CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Konya",
  "Gaziantep", "Mersin", "Kayseri", "Eskişehir", "Samsun", "Trabzon", "Muğla",
] as const;

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

/** Build için: büyük şehirlerin ilçe × hizmet kombinasyonları */
export function getTopCityDistrictServiceParams() {
  const params: { city: string; district: string; service: string }[] = [];
  for (const city of TOP_CITIES) {
    const districtList = districts[city];
    if (!districtList) continue;
    const citySlug = toSlug(city);
    for (const district of districtList) {
      const districtSlug = toSlug(district);
      for (const service of services) {
        params.push({ city: citySlug, district: districtSlug, service: service.slug });
      }
    }
  }
  return params;
}

export function getCityDistrictServiceParams() {
  const params: { city: string; district: string; service: string }[] = [];

  for (const [city, districtList] of Object.entries(districts)) {
    const citySlug = toSlug(city);
    for (const district of districtList) {
      const districtSlug = toSlug(district);
      for (const service of services) {
        params.push({ city: citySlug, district: districtSlug, service: service.slug });
      }
    }
  }

  return params;
}

export function districtServicePath(citySlug: string, districtSlug: string, serviceSlug: string) {
  return `/lokasyon/${citySlug}/ilce/${districtSlug}/${serviceSlug}`;
}

export function cityServicePath(citySlug: string, serviceSlug: string) {
  return `/lokasyon/${citySlug}/${serviceSlug}`;
}

export function cityPath(citySlug: string) {
  return `/lokasyon/${citySlug}`;
}

export function getCitiesWithDistricts(): string[] {
  return Object.keys(districts);
}

export { cities, categories, services, getDistricts };
