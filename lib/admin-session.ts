import { hmacSha256Hex, timingSafeEqualStrings } from "@/lib/edge-hmac";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 saat

const SESSION_MESSAGE = "cokusta-admin-session";

let cachedAdminToken: string | null = null;

export async function createSessionToken(): Promise<string> {
  if (!cachedAdminToken) {
    cachedAdminToken = await hmacSha256Hex(SESSION_MESSAGE);
  }
  return cachedAdminToken;
}

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  return timingSafeEqualStrings(expected, token);
}
