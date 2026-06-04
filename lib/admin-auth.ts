import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  isValidSessionToken,
} from "@/lib/admin-session";
import { getAdminPassword, isAdminPasswordConfigured } from "@/lib/security-secrets";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

import { COKUSTA_COMMISSION_RATE } from "./pricing";

export function getCommissionRate(): number {
  const envRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? "");
  if (Number.isFinite(envRate) && envRate > 0) return envRate;
  return COKUSTA_COMMISSION_RATE;
}

export { COOKIE_NAME, createSessionToken, isValidSessionToken };
export { isAdminPasswordConfigured, isAdminSessionConfigured } from "@/lib/security-secrets";

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return timingSafeEqual(expected, password);
}

export async function setAdminSession(): Promise<void> {
  const token = await createSessionToken();
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
