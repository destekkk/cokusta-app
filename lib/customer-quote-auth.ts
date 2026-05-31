import { cookies } from "next/headers";
import { normalizePhone } from "@/lib/quote-privacy";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function cookieName(quoteId: string) {
  return `quote_access_${quoteId.slice(0, 32)}`;
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "cokusta-dev-secret-change-me";
}

async function sign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createCustomerQuoteToken(
  quoteId: string,
  phone: string
): Promise<string> {
  return sign(`${quoteId}:${normalizePhone(phone)}`);
}

export async function setCustomerQuoteAccess(quoteId: string, phone: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(cookieName(quoteId), await createCustomerQuoteToken(quoteId, phone), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function hasCustomerQuoteAccess(
  quoteId: string,
  phone: string
): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(quoteId))?.value;
  if (!token) return false;
  const expected = await createCustomerQuoteToken(quoteId, phone);
  if (token.length !== expected.length) return false;
  let ok = 0;
  for (let i = 0; i < token.length; i++) {
    ok |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return ok === 0;
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}
