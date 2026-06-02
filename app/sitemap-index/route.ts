import { buildSitemapIndexXml } from "@/lib/seo/sitemap-index-xml";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return new Response(buildSitemapIndexXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
