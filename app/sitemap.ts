import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";
import {
  SITEMAP_CHUNK_SIZE,
  getSitemapChunkCount,
  getSitemapUrlChunk,
} from "@/lib/seo/sitemap-urls";

export async function generateSitemaps() {
  const count = getSitemapChunkCount();
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const start = id * SITEMAP_CHUNK_SIZE;
  const end = start + SITEMAP_CHUNK_SIZE;
  const chunk = getSitemapUrlChunk(start, end);
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
