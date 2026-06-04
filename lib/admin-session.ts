import { hmacSha256Hex, timingSafeEqualStrings } from "@/lib/edge-hmac";
import { getAdminSessionSecret } from "@/lib/security-secrets";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 saat

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getAdminSessionSecret();
  if (!secret) return "";
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const nonce = randomNonce();
  const payload = `${exp}.${nonce}`;
  const sig = await hmacSha256Hex(payload);
  return `${payload}.${sig}`;
}

const tokenValidationCache = new Map<string, { valid: boolean; until: number }>();
const TOKEN_CACHE_MS = 8_000;

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token || !getAdminSessionSecret()) return false;

  const now = Date.now();
  const cached = tokenValidationCache.get(token);
  if (cached && now < cached.until) return cached.valid;

  const dot1 = token.indexOf(".");
  const dot2 = token.indexOf(".", dot1 + 1);
  if (dot1 <= 0 || dot2 <= dot1) return false;

  const expStr = token.slice(0, dot1);
  const nonce = token.slice(dot1 + 1, dot2);
  const sig = token.slice(dot2 + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  if (!nonce || !sig) return false;

  const payload = `${expStr}.${nonce}`;
  const expected = await hmacSha256Hex(payload);
  const valid = timingSafeEqualStrings(sig, expected);
  tokenValidationCache.set(token, { valid, until: now + TOKEN_CACHE_MS });
  if (tokenValidationCache.size > 500) {
    for (const [k, v] of tokenValidationCache) {
      if (now >= v.until) tokenValidationCache.delete(k);
    }
  }
  return valid;
}
