import { cookies } from "next/headers";
import { normalizePhone } from "@/lib/quote-privacy";
import { normalizeProviderPhone } from "@/lib/phone-utils";
import {
  PROVIDER_COOKIE,
  createProviderSessionToken,
  getProviderSessionFromToken,
  parseProviderSessionToken,
} from "@/lib/provider-session";

export {
  normalizePhone,
  normalizeProviderPhone,
  PROVIDER_COOKIE,
  getProviderSessionFromToken,
  parseProviderSessionToken,
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export async function setProviderSession(providerId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PROVIDER_COOKIE, await createProviderSessionToken(providerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearProviderSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PROVIDER_COOKIE);
}

export async function getProviderSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return parseProviderSessionToken(cookieStore.get(PROVIDER_COOKIE)?.value);
}
