import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = resolveSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/", "/teklif-al/onay", "/usta-ol/onay"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
