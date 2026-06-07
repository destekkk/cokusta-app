import { buildSitemapIndexXml } from "@/lib/seo/sitemap-index-xml";

export function createSitemapIndexResponse(): Response {
  return new Response(buildSitemapIndexXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
