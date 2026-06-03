/** Edge middleware uyumlu müşteri oturum yardımcıları. */

import { hmacSha256Hex, timingSafeEqualStrings } from "@/lib/edge-hmac";
import { normalizeProviderPhone } from "@/lib/phone-utils";

export const CUSTOMER_COOKIE = "customer_session";

export async function createCustomerSessionToken(phone: string): Promise<string> {
  const normalized = normalizeProviderPhone(phone);
  const signature = await hmacSha256Hex(normalized);
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
  const expected = await hmacSha256Hex(phone);
  return timingSafeEqualStrings(signature, expected) ? phone : null;
}

export async function getCustomerSessionFromToken(
  token: string | undefined
): Promise<{ phone: string } | null> {
  const phone = await parseCustomerSessionToken(token);
  return phone ? { phone } : null;
}
