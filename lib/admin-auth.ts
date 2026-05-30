import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  isValidSessionToken,
} from "@/lib/admin-session";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "Btl.2012";
}

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

export function verifyPassword(password: string): boolean {
  return timingSafeEqual(getAdminPassword(), password);
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createSessionToken(), {
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
