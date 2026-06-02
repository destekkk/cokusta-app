import type { Metadata } from "next";
import type { Service } from "@/lib/types";
import {
  buildCategoryLocationKeywords,
  buildLocationSearchKeywords,
  capitalizeTr,
  getCategorySearchTerms,
  getPrimarySearchTerm,
} from "@/lib/seo/keywords";

import { resolveSiteUrl } from "@/lib/seo/site-url";

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Çokusta";

type LocalSeoInput = {
  city: string;
  district?: string;
  neighborhood?: string;
  service?: Service;
  categoryName?: string;
};

function locationLabel(city: string, district?: string, neighborhood?: string) {
  if (neighborhood && district) return `${district} ${neighborhood}, ${city}`;
  if (district) return `${city} ${district}`;
  return city;
}

export function buildLocalTitle({ city, district, neighborhood, service }: LocalSeoInput) {
  const loc = locationLabel(city, district, neighborhood);
  if (service) {
    const term = capitalizeTr(getPrimarySearchTerm(service.slug));
    return `${loc} ${term} | ${service.name} Ustası | ${SITE_NAME}`;
  }
  return `${loc} Usta ve Hizmet | ${SITE_NAME}`;
}

export function buildLocalDescription({ city, district, neighborhood, service }: LocalSeoInput) {
  const loc = locationLabel(city, district, neighborhood);
  if (service) {
    const term = getPrimarySearchTerm(service.slug);
    return `${loc} ${term} arayanlar için doğrulanmış ustalar. Ücretsiz teklif alın, ${term} fiyatlarını karşılaştırın, güvenle hizmet alın. ${service.providers.toLocaleString("tr-TR")}+ usta.`;
  }
  return `${loc} boyacı, elektrikçi, nakliyeci, tesisatçı ve tüm ustalar. Doğrulanmış hizmet sağlayıcıları, ücretsiz teklif, güvenli ödeme. ${SITE_NAME}.`;
}

export function buildLocalKeywords(input: LocalSeoInput) {
  if (!input.service) {
    return buildLocationSearchKeywords({
      city: input.city,
      district: input.district,
      neighborhood: input.neighborhood,
      serviceSlug: "genel",
      serviceName: "hizmet",
    });
  }
  return buildLocationSearchKeywords({
    city: input.city,
    district: input.district,
    neighborhood: input.neighborhood,
    serviceSlug: input.service.slug,
    serviceName: input.service.name,
    categorySlug: input.service.categorySlug,
  });
}

export function buildCanonical(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildLocalMetadata(
  input: LocalSeoInput & { path: string; canonicalPath?: string }
): Metadata {
  const title = buildLocalTitle(input);
  const description = buildLocalDescription(input);
  const keywords = buildLocalKeywords(input);
  const canonical = buildCanonical(input.canonicalPath ?? input.path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "tr_TR",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export function buildServiceMetadata(service: Service, city?: string): Metadata {
  const term = capitalizeTr(getPrimarySearchTerm(service.slug));
  const title = city
    ? `${city} ${term} | ${service.name} | ${SITE_NAME}`
    : `${service.name} | ${SITE_NAME}`;
  const description = city
    ? `${city} ${term} — ${service.longDescription.slice(0, 120)}…`
    : `${service.longDescription.slice(0, 155)}…`;

  return {
    title,
    description,
    keywords: buildLocationSearchKeywords({
      city: city ?? "Türkiye",
      serviceSlug: service.slug,
      serviceName: service.name,
      categorySlug: service.categorySlug,
    }),
    alternates: { canonical: buildCanonical(`/hizmet/${service.slug}`) },
    openGraph: { title, description, url: buildCanonical(`/hizmet/${service.slug}`), locale: "tr_TR" },
  };
}

export function buildCategoryLocationMetadata(input: {
  city: string;
  district?: string;
  categorySlug: string;
  categoryName: string;
  path: string;
}): Metadata {
  const loc = input.district ? `${input.city} ${input.district}` : input.city;
  const terms = getCategorySearchTerms(input.categorySlug);
  const primary = capitalizeTr(terms[0] ?? input.categoryName);
  const title = `${loc} ${primary} | ${input.categoryName} | ${SITE_NAME}`;
  const description = `${loc} ${input.categoryName.toLowerCase()} ustası arayanlar için doğrulanmış hizmet sağlayıcıları. Ücretsiz teklif alın, ${primary.toLowerCase()} fiyatlarını karşılaştırın.`;
  const keywords = buildCategoryLocationKeywords({
    city: input.city,
    district: input.district,
    categorySlug: input.categorySlug,
    categoryName: input.categoryName,
  });
  const canonical = buildCanonical(input.path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: SITE_NAME, locale: "tr_TR", type: "website" },
    robots: { index: true, follow: true },
  };
}

export function buildDistrictMetadata(input: {
  city: string;
  district: string;
  path: string;
}): Metadata {
  const loc = `${input.city} ${input.district}`;
  const title = `${loc} Usta ve Hizmet | ${SITE_NAME}`;
  const description = `${loc} boyacı, elektrikçi, nakliyeci, tesisatçı, temizlik ve tadilat ustası. Doğrulanmış ustalar, ücretsiz teklif, güvenli ödeme.`;
  const keywords = buildLocationSearchKeywords({
    city: input.city,
    district: input.district,
    serviceSlug: "genel",
    serviceName: "hizmet",
  });

  return {
    title,
    description,
    keywords,
    alternates: { canonical: buildCanonical(input.path) },
    openGraph: { title, description, url: buildCanonical(input.path), siteName: SITE_NAME, locale: "tr_TR" },
    robots: { index: true, follow: true },
  };
}
