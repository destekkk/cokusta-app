import type { ProviderQuoteLocationFilter } from "@/lib/offer-utils";
import { resolveCanonicalCityName } from "@/lib/offer-utils";

function normalizeStoredCity(city: string): string {
  return resolveCanonicalCityName(city).toLocaleLowerCase("tr-TR");
}

export const PROVIDER_LOCATION_STORAGE_KEY = "cokusta-usta-location-filter-v2";

type StoredProviderLocation = {
  filter: ProviderQuoteLocationFilter;
  profileCity: string;
};

export function readProviderLocationFilter(profileCity = ""): ProviderQuoteLocationFilter {
  if (typeof window === "undefined") return { cityMode: "provider" };

  try {
    const raw = localStorage.getItem(PROVIDER_LOCATION_STORAGE_KEY);
    if (!raw) return { cityMode: "provider" };

    const parsed = JSON.parse(raw) as StoredProviderLocation | ProviderQuoteLocationFilter;

    if ("filter" in parsed && parsed.filter?.cityMode) {
      if (profileCity && parsed.profileCity && parsed.profileCity !== profileCity) {
        return { cityMode: "provider" };
      }
      if (
        profileCity &&
        parsed.filter.cityMode === "selected" &&
        parsed.filter.selectedCity &&
        normalizeStoredCity(parsed.filter.selectedCity) !== normalizeStoredCity(profileCity)
      ) {
        return { cityMode: "provider" };
      }
      return parsed.filter;
    }

    const legacy = parsed as ProviderQuoteLocationFilter;
    if (legacy.cityMode) {
      if (
        profileCity &&
        legacy.cityMode === "selected" &&
        legacy.selectedCity &&
        legacy.selectedCity !== profileCity
      ) {
        return { cityMode: "provider" };
      }
      return legacy;
    }
  } catch {
    /* ignore */
  }

  return { cityMode: "provider" };
}

export function writeProviderLocationFilter(
  filter: ProviderQuoteLocationFilter,
  profileCity: string
): void {
  if (typeof window === "undefined") return;
  const payload: StoredProviderLocation = { filter, profileCity };
  localStorage.setItem(PROVIDER_LOCATION_STORAGE_KEY, JSON.stringify(payload));
}

export function resetProviderLocationFilter(profileCity: string): ProviderQuoteLocationFilter {
  const filter: ProviderQuoteLocationFilter = { cityMode: "provider" };
  writeProviderLocationFilter(filter, profileCity);
  return filter;
}
