import type { Service } from "@/lib/types";
import { services } from "./data/services";

export type SearchParams = {
  q?: string;
  kategori?: string;
  sehir?: string;
};

export function searchServices(params: SearchParams): Service[] {
  let results = [...services];

  if (params.kategori) {
    results = results.filter((s) => s.categorySlug === params.kategori);
  }

  if (params.q) {
    const query = params.q.toLowerCase().trim();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.longDescription.toLowerCase().includes(query)
    );
  }

  return results.sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return b.providers - a.providers;
  });
}

export function buildSearchUrl(params: SearchParams): string {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.kategori) searchParams.set("kategori", params.kategori);
  if (params.sehir) searchParams.set("sehir", params.sehir);
  const qs = searchParams.toString();
  return qs ? `/ara?${qs}` : "/ara";
}
