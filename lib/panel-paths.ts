/** Panel sayfalarında Header'da misafir usta CTA'ları gizlenir */

const USTA_PANEL_ROUTE_PREFIXES = [
  "/usta/teklifler",
  "/usta/kontor",
  "/usta/odeme-talep",
  "/usta/uygulama",
  "/usta/portfolyo",
] as const;

const USTA_PANEL_PUBLIC_PREFIXES = ["/usta/giris", "/usta/kontor/sonuc"] as const;

/** Müşteri girişi — usta linkleri gösterilebilir */
const CUSTOMER_PUBLIC_PREFIXES = ["/musteri/giris", "/musteri/kontor/sonuc"] as const;

export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return "";
  const base = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base;
}

export function isUstaPanelPath(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  if (!path.startsWith("/usta/")) return false;
  if (USTA_PANEL_PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }
  return USTA_PANEL_ROUTE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export function isCustomerPanelPath(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  if (path.startsWith("/tekliflerim")) return true;
  if (!path.startsWith("/musteri/")) return false;
  if (CUSTOMER_PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }
  return true;
}

export function isAppPanelPath(pathname: string | null | undefined): boolean {
  return isUstaPanelPath(pathname) || isCustomerPanelPath(pathname);
}

export function shouldShowUstaGuestLinks(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  if (!path) return false;
  return !isUstaPanelPath(path) && !isCustomerPanelPath(path);
}

/** @deprecated use shouldShowUstaGuestLinks */
export function shouldShowUstaOlLink(pathname: string | null | undefined): boolean {
  return shouldShowUstaGuestLinks(pathname);
}
