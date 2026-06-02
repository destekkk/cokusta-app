import { resolveSiteUrl } from "@/lib/seo/site-url";
import { getSitemapChunkCount } from "@/lib/seo/sitemap-urls";

export function buildSitemapIndexXml(): string {
  const base = resolveSiteUrl();
  const count = getSitemapChunkCount();
  const entries = Array.from({ length: count }, (_, id) => {
    return `  <sitemap>\n    <loc>${base}/sitemap/${id}.xml</loc>\n  </sitemap>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

export function getSitemapChunkUrls(): string[] {
  const base = resolveSiteUrl();
  const count = getSitemapChunkCount();
  return Array.from({ length: count }, (_, id) => `${base}/sitemap/${id}.xml`);
}
