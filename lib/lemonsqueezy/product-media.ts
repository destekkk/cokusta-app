import { getShopPackage } from "@/lib/credit-packages";
import { resolveSiteUrl } from "@/lib/seo/site-url";

/** Lemon checkout product_options — isim, açıklama, görsel URL. */
export function getCheckoutProductOptions(packageSlug: string): {
  name: string;
  description: string;
  media: string[];
  receipt_thank_you_note: string;
} {
  const pkg = getShopPackage(packageSlug);
  const site = resolveSiteUrl();

  const name = pkg?.name ?? "Çokusta Kontör Paketi";
  const description =
    pkg?.description ??
    "Çokusta usta paneli kontör paketi. Ödeme sonrası kontörler hesabınıza otomatik yüklenir.";

  const media = resolvePackageMediaUrls(packageSlug, site);

  return {
    name,
    description,
    media,
    receipt_thank_you_note:
      "Çokusta'ya güveniniz için teşekkürler. Kontörleriniz kısa süre içinde hesabınıza yansır.",
  };
}

function resolvePackageMediaUrls(packageSlug: string, site: string): string[] {
  const perPackageKey = `LEMONSQUEEZY_MEDIA_${packageSlug.replace(/-/g, "_").toUpperCase()}`;
  const perPackage = process.env[perPackageKey]?.trim();
  if (perPackage) return [perPackage];

  const defaultImage = process.env.LEMONSQUEEZY_DEFAULT_PRODUCT_IMAGE?.trim();
  if (defaultImage) return [defaultImage];

  // Lemon çoğu zaman PNG/JPG ister; SVG yedek (panelden PNG yüklemeniz önerilir)
  return [`${site}/images/brand/cokusta-logo.svg`];
}
