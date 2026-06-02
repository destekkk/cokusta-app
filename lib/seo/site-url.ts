/** Canlı site kök URL — sitemap, robots, metadata ve ödeme callback için */
export function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (
    fromEnv &&
    !fromEnv.includes("vercel.app") &&
    !fromEnv.includes("localhost") &&
    !fromEnv.startsWith("http://")
  ) {
    return fromEnv;
  }
  return "https://www.cokusta.com";
}
