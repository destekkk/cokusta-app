import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const BLOCKED_PINS = new Set(["1234", "0000"]);
const PBKDF2_ITERATIONS = 100_000;

/** Türkiye cep telefonu — baştaki 0 olmadan da kabul edilir (532… → 0532…) */
export function normalizeProviderPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.length === 10 && digits.startsWith("5")) {
    digits = `0${digits}`;
  }

  return digits;
}

export function isValidProviderPhone(phone: string): boolean {
  return /^05\d{9}$/.test(normalizeProviderPhone(phone));
}

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
