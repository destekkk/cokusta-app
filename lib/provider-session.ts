/** Edge middleware uyumlu usta oturum yardımcıları (Node crypto yok). */

export const PROVIDER_COOKIE = "provider_session";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "cokusta-dev-secret-change-me";
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createProviderSessionToken(providerId: string): Promise<string> {
  const signature = await sign(providerId);
  return `${providerId}.${signature}`;
}

export async function parseProviderSessionToken(
  token: string | undefined
): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const providerId = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await sign(providerId);
  if (signature.length !== expected.length) return null;
  let ok = 0;
  for (let i = 0; i < signature.length; i++) {
    ok |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return ok === 0 ? providerId : null;
}

export async function getProviderSessionFromToken(
  token: string | undefined
): Promise<{ providerId: string } | null> {
  const providerId = await parseProviderSessionToken(token);
  return providerId ? { providerId } : null;
}
