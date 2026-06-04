/** Üretimde zorunlu gizlilik değişkenleri — varsayılan şifre/anahtar yok. */

const DEV_SESSION_SECRET = "cokusta-local-dev-only-not-for-production!!";
const MIN_SESSION_SECRET_LEN = 32;
const MIN_ADMIN_PASSWORD_LEN = 8;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Oturum HMAC anahtarı; üretimde yapılandırılmamışsa boş döner. */
export function getAdminSessionSecret(): string {
  const raw = process.env.ADMIN_SESSION_SECRET?.trim();
  if (raw && raw.length >= MIN_SESSION_SECRET_LEN) return raw;
  if (!isProduction()) return DEV_SESSION_SECRET;
  return "";
}

export function isAdminSessionConfigured(): boolean {
  return getAdminSessionSecret().length >= MIN_SESSION_SECRET_LEN;
}

/** Admin panel şifresi; üretimde yapılandırılmamışsa null. */
export function getAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD?.trim();
  if (raw && raw.length >= MIN_ADMIN_PASSWORD_LEN) return raw;
  if (!isProduction()) {
    const dev = process.env.ADMIN_PASSWORD?.trim();
    return dev && dev.length > 0 ? dev : "local-dev-only";
  }
  return null;
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPassword() !== null;
}
