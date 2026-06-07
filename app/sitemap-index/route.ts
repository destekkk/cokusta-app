import { createSitemapIndexResponse } from "@/lib/seo/sitemap-index-response";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return createSitemapIndexResponse();
}
