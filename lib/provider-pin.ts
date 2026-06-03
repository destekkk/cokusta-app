import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
export { normalizeProviderPhone, isValidProviderPhone } from "@/lib/phone-utils";

/** Yeni kayıtlarda zorunlu şifre uzunluğu */
export const NEW_PIN_LENGTH = 6;

const PBKDF2_ITERATIONS = 100_000;

const BLOCKED_PINS_4 = new Set(["1234", "0000"]);

function isAllSameDigit(pin: string): boolean {
  return /^(\d)\1+$/.test(pin);
}

/** Ardışık rakam: 123456, 654321, 012345 vb. */
function isSequentialPin(pin: string): boolean {
  const digits = pin.split("").map((c) => Number(c));
  if (digits.some((n) => Number.isNaN(n))) return false;

  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) ascending = false;
    if (digits[i] !== digits[i - 1] - 1) descending = false;
  }
  return ascending || descending;
}

function isWeakNewPin(pin: string): boolean {
  if (isAllSameDigit(pin)) return true;
  if (isSequentialPin(pin)) return true;
  if (pin.length === 4 && BLOCKED_PINS_4.has(pin)) return true;
  return false;
}

/** Giriş: mevcut 4 haneli şifreler geçerli; 4 veya 6 rakam */
export function isLoginPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin) || /^\d{6}$/.test(pin);
}

export function loginPinFormatError(): string {
  return "Giriş şifreniz 4 veya 6 rakamdan oluşmalıdır.";
}

/** Kayıt / şifre belirleme: yalnızca 6 hane, zayıf kombinasyonlar yasak */
export function validateNewPin(pin: string): { ok: true } | { ok: false; error: string } {
  if (!/^\d{6}$/.test(pin)) {
    return {
      ok: false,
      error: `Giriş şifresi ${NEW_PIN_LENGTH} rakamdan oluşmalıdır.`,
    };
  }

  if (isWeakNewPin(pin)) {
    return {
      ok: false,
      error:
        "Bu şifre kullanılamaz (ör. 111111, 123456, 000000 veya ardışık/tekrarlayan rakamlar). Farklı bir 6 haneli şifre seçin.",
    };
  }

  return { ok: true };
}

/** @deprecated Yeni kodda validateNewPin kullanın */
export function validateProviderPin(pin: string): { ok: true } | { ok: false; error: string } {
  return validateNewPin(pin);
}

export function sanitizePinDigits(value: string, maxLen = NEW_PIN_LENGTH): string {
  return value.replace(/\D/g, "").slice(0, maxLen);
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
