import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { SITE_URL } from "@/lib/seo/metadata";
import {
  cityPath,
  cityServicePath,
  districtServicePath,
  getAllCitySlugs,
  getCityDistrictServiceParams,
  getCityServiceParams,
} from "@/lib/seo/slugs";

const CHUNK_SIZE = 4500;

function buildAllUrls(): string[] {
  const urls: string[] = [
    "",
    "/hizmetler",
    "/nasil-calisir",
    "/hakkimizda",
    "/usta-ol",
    "/cok-acil",
    "/gizlilik-sozlesmesi",
    "/mesafeli-satis-sozlesmesi",
    "/teslimat-ve-iade",
    "/ssl-sertifikasi",
  ];

  for (const cat of categories) urls.push(`/kategori/${cat.slug}`);
  for (const service of services) urls.push(`/hizmet/${service.slug}`);
  for (const citySlug of getAllCitySlugs()) urls.push(cityPath(citySlug));
  for (const { city, service } of getCityServiceParams()) {
    urls.push(cityServicePath(city, service));
  }
  for (const { city, district, service } of getCityDistrictServiceParams()) {
    urls.push(districtServicePath(city, district, service));
  }

  return urls;
}

const ALL_URLS = buildAllUrls();

export async function generateSitemaps() {
  const count = Math.ceil(ALL_URLS.length / CHUNK_SIZE);
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const chunk = ALL_URLS.slice(id * CHUNK_SIZE, (id + 1) * CHUNK_SIZE);
  const now = new Date();

  return chunk.map((path) => {
    const isLocal = path.startsWith("/lokasyon/");
    const isService = path.startsWith("/hizmet/");
    return {
      url: `${SITE_URL}${path || "/"}`,
      lastModified: now,
      changeFrequency: (isLocal || isService ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : isLocal ? 0.8 : isService ? 0.85 : 0.6,
    };
  });
}
