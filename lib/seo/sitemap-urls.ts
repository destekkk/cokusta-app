import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import {
  cityCategoryPath,
  cityPath,
  cityServicePath,
  districtPath,
  districtServicePath,
  getAllCitySlugs,
  getCityCategoryParams,
  getCityDistrictServiceParams,
  getCityServiceParams,
  getDistrictHubParams,
  getNeighborhoodServiceParams,
  neighborhoodServicePath,
  toSlug,
} from "@/lib/seo/slugs";
import { getAllServiceSlugAliases } from "@/lib/seo/keywords";
import { cities, getDistricts } from "@/lib/data/cities";
import { getAllNeighborhoodParams } from "@/lib/data/neighborhoods";

const STATIC_PATHS = [
  "",
  "/lokasyon",
  "/hizmetler",
  "/nasil-calisir",
  "/hakkimizda",
  "/iletisim",
  "/usta-ol",
  "/cok-acil",
  "/gizlilik-sozlesmesi",
  "/mesafeli-satis-sozlesmesi",
  "/teslimat-ve-iade",
  "/ssl-sertifikasi",
];

function* allSitemapUrls(): Generator<string> {
  const seen = new Set<string>();

  function emit(path: string) {
    if (seen.has(path)) return;
    seen.add(path);
    return path;
  }

  for (const path of STATIC_PATHS) {
    const v = emit(path);
    if (v !== undefined) yield v;
  }

  for (const cat of categories) {
    const v = emit(`/kategori/${cat.slug}`);
    if (v !== undefined) yield v;
  }

  for (const service of services) {
    const v = emit(`/hizmet/${service.slug}`);
    if (v !== undefined) yield v;
  }

  for (const citySlug of getAllCitySlugs()) {
    const v = emit(cityPath(citySlug));
    if (v !== undefined) yield v;
  }

  for (const { city, category } of getCityCategoryParams()) {
    const v = emit(cityCategoryPath(city, category));
    if (v !== undefined) yield v;
  }

  for (const { city, service } of getCityServiceParams()) {
    const v = emit(cityServicePath(city, service));
    if (v !== undefined) yield v;
  }

  for (const city of cities) {
    const citySlug = toSlug(city);
    for (const { alias } of getAllServiceSlugAliases()) {
      const v = emit(cityServicePath(citySlug, alias));
      if (v !== undefined) yield v;
    }
  }

  for (const { city, district } of getDistrictHubParams()) {
    const v = emit(districtPath(city, district));
    if (v !== undefined) yield v;
  }

  for (const { city, district, service } of getCityDistrictServiceParams()) {
    const v = emit(districtServicePath(city, district, service));
    if (v !== undefined) yield v;
  }

  for (const { city, district, neighborhood, service } of getNeighborhoodServiceParams()) {
    const v = emit(neighborhoodServicePath(city, district, neighborhood, service));
    if (v !== undefined) yield v;
  }
}

let cachedCount: number | null = null;

/** Tam sayım yerine hızlı tahmin — build süresini kısaltır */
export function estimateSitemapUrlCount(): number {
  const districtCount = cities.reduce((sum, city) => sum + getDistricts(city).length, 0);
  const aliasCount = getAllServiceSlugAliases().length;
  const neighborhoodCount = getAllNeighborhoodParams().length;
  return (
    STATIC_PATHS.length +
    categories.length +
    services.length +
    cities.length +
    cities.length * categories.length +
    cities.length * services.length +
    cities.length * aliasCount +
    districtCount +
    districtCount * services.length +
    neighborhoodCount * 20
  );
}

export function getSitemapUrlCount(): number {
  if (cachedCount !== null) return cachedCount;
  cachedCount = estimateSitemapUrlCount();
  return cachedCount;
}

export function getSitemapUrlChunk(start: number, end: number): string[] {
  const chunk: string[] = [];
  let index = 0;
  for (const url of allSitemapUrls()) {
    if (index >= end) break;
    if (index >= start) chunk.push(url);
    index++;
  }
  return chunk;
}

export const SITEMAP_CHUNK_SIZE = 4500;

export function getSitemapChunkCount(): number {
  return Math.ceil(getSitemapUrlCount() / SITEMAP_CHUNK_SIZE);
}
