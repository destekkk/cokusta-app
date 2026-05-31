import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
export { normalizeProviderPhone, isValidProviderPhone } from "@/lib/phone-utils";

const BLOCKED_PINS = new Set(["1234", "0000"]);
const PBKDF2_ITERATIONS = 100_000;

export function validateProviderPin(pin: string): { ok: true } | { ok: false; error: string } {
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: "Giriş şifresi 4 rakamdan oluşmalıdır." };
  }

  if (BLOCKED_PINS.has(pin)) {
    return { ok: false, error: "Bu şifre kullanılamaz. Lütfen farklı bir 4 haneli şifre seçin." };
  }

  return { ok: true };
}

export function hashProviderPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyProviderPin(pin: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;

  const hash = pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex");
  if (hash.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
}
