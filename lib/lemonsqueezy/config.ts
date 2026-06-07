/** Lemon Squeezy ortam değişkenleri — anahtarlar koda gömülmez. */

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(getLemonApiKey() && getLemonStoreId());
}

export function getLemonApiKey(): string {
  return process.env.LEMONSQUEEZY_API_KEY?.trim() ?? "";
}

export function getLemonStoreId(): string {
  return process.env.LEMONSQUEEZY_STORE_ID?.trim() ?? "";
}

export function getLemonWebhookSecret(): string {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() ?? "";
}

export function isLemonTestMode(): boolean {
  const raw = process.env.LEMONSQUEEZY_TEST_MODE?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

/** Paket slug → Lemon variant ID (LEMONSQUEEZY_VARIANT_KONTOR_10 vb.) */
export function getLemonVariantId(packageSlug: string): string | null {
  const envKey = `LEMONSQUEEZY_VARIANT_${packageSlug.replace(/-/g, "_").toUpperCase()}`;
  const id = process.env[envKey]?.trim();
  return id && /^\d+$/.test(id) ? id : null;
}

/** Mağaza slug — lemon.js doğrudan buy linki için (ör. magazan) */
export function getLemonStoreSlug(): string {
  return process.env.LEMONSQUEEZY_STORE_SLUG?.trim() ?? "";
}

/** Statik variant buy URL — API olmadan embed buton için */
export function getLemonVariantBuyUrl(packageSlug: string): string | null {
  const variantId = getLemonVariantId(packageSlug);
  const storeSlug = getLemonStoreSlug();
  if (!variantId || !storeSlug) return null;
  return `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}`;
}
