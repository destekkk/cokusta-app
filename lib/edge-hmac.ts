/** Edge middleware — HMAC anahtarını her istekte yeniden import etme (panel gezinme hızı). */

let cachedKey: CryptoKey | null = null;
let cachedSecret: string | null = null;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "cokusta-dev-secret-change-me";
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecret();
  if (cachedKey && cachedSecret === secret) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  cachedSecret = secret;
  return cachedKey;
}

export async function hmacSha256Hex(message: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i++) {
    ok |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return ok === 0;
}
