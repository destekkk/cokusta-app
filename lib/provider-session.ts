/** Edge middleware uyumlu usta oturum yardımcıları (Node crypto yok). */

import { hmacSha256Hex, timingSafeEqualStrings } from "@/lib/edge-hmac";

export const PROVIDER_COOKIE = "provider_session";

export async function createProviderSessionToken(providerId: string): Promise<string> {
  const signature = await hmacSha256Hex(providerId);
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
  const expected = await hmacSha256Hex(providerId);
  return timingSafeEqualStrings(signature, expected) ? providerId : null;
}

export async function getProviderSessionFromToken(
  token: string | undefined
): Promise<{ providerId: string } | null> {
  const providerId = await parseProviderSessionToken(token);
  return providerId ? { providerId } : null;
}
