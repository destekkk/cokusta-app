/** Edge middleware uyumlu müşteri oturum yardımcıları. */

import { normalizeProviderPhone } from "@/lib/phone-utils";

export const CUSTOMER_COOKIE = "customer_session";

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

export async function createCustomerSessionToken(phone: string): Promise<string> {
  const normalized = normalizeProviderPhone(phone);
  const signature = await sign(normalized);
  return `${normalized}.${signature}`;
}

export async function parseCustomerSessionToken(
  token: string | undefined
): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const phone = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await sign(phone);
  if (signature.length !== expected.length) return null;
  let ok = 0;
  for (let i = 0; i < signature.length; i++) {
    ok |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return ok === 0 ? phone : null;
}

export async function getCustomerSessionFromToken(
  token: string | undefined
): Promise<{ phone: string } | null> {
  const phone = await parseCustomerSessionToken(token);
  return phone ? { phone } : null;
}
