import type { Metadata } from "next";
import type { Service } from "@/lib/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cokusta.com";
export const SITE_NAME = "Çokusta";

type LocalSeoInput = {
  city: string;
  district?: string;
  service?: Service;
  categoryName?: string;
};

function locationLabel(city: string, district?: string) {
  return district ? `${city} ${district}` : city;
}

export function buildLocalTitle({ city, district, service, categoryName }: LocalSeoInput) {
  const loc = locationLabel(city, district);
  if (service) return `${loc} ${service.name} | ${SITE_NAME}`;
  if (categoryName) return `${loc} ${categoryName} Hizmetleri | ${SITE_NAME}`;
  return `${loc} Hizmetleri ve Ustalar | ${SITE_NAME}`;
}

export function buildLocalDescription({ city, district, service, categoryName }: LocalSeoInput) {
  const loc = locationLabel(city, district);
  if (service) {
    return `${loc} ${service.name.toLowerCase()} için doğrulanmış ustalar. Ücretsiz teklif alın, fiyatları karşılaştırın, güvenle hizmet alın. ${service.providers.toLocaleString("tr-TR")}+ usta, ${service.rating} puan.`;
  }
  if (categoryName) {
    return `${loc} bölgesinde ${categoryName.toLowerCase()} hizmetleri. Doğrulanmış ustalar, şeffaf fiyat, güvenli ödeme. Hemen ücretsiz teklif alın.`;
  }
  return `${loc} için tadilat, nakliyat, temizlik, tesisat ve daha fazlası. Doğrulanmış ustalar, ücretsiz teklif, güvenli ödeme. ${SITE_NAME} ile hizmet alın.`;
}

export function buildLocalKeywords({ city, district, service, categoryName }: LocalSeoInput) {
  const loc = locationLabel(city, district);
  const parts = [loc, city, district, service?.name, categoryName, "usta", "teklif al", "hizmet", SITE_NAME]
    .filter(Boolean)
    .map(String);
  return [...new Set(parts)];
}

export function buildCanonical(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildLocalMetadata(input: LocalSeoInput & { path: string }): Metadata {
  const title = buildLocalTitle(input);
  const description = buildLocalDescription(input);
  const keywords = buildLocalKeywords(input);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: buildCanonical(input.path) },
    openGraph: {
      title,
      description,
      url: buildCanonical(input.path),
      siteName: SITE_NAME,
      locale: "tr_TR",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export function buildServiceMetadata(service: Service, city?: string): Metadata {
  const title = city
    ? `${city} ${service.name} | ${SITE_NAME}`
    : `${service.name} | ${SITE_NAME}`;
  const description = city
    ? `${city} ${service.name.toLowerCase()} — ${service.longDescription.slice(0, 120)}…`
    : `${service.longDescription.slice(0, 155)}…`;
  const path = city
    ? `/lokasyon/${city.toLowerCase().replace(/ı/g, "i").replace(/İ/g, "i")}/${service.slug}`
    : `/hizmet/${service.slug}`;

  return {
    title,
    description,
    alternates: { canonical: buildCanonical(`/hizmet/${service.slug}`) },
    openGraph: { title, description, url: buildCanonical(`/hizmet/${service.slug}`), locale: "tr_TR" },
  };
}
