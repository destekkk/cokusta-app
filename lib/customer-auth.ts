import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionToken,
  parseCustomerSessionToken,
} from "@/lib/customer-session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export function customerSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

export async function setCustomerSession(phone: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    CUSTOMER_COOKIE,
    await createCustomerSessionToken(phone),
    customerSessionCookieOptions()
  );
}

/** Route handler yanıtına oturum çerezini ekler (Set-Cookie güvenilir olsun diye). */
export async function attachCustomerSessionCookie(
  response: import("next/server").NextResponse,
  phone: string
): Promise<void> {
  response.cookies.set(
    CUSTOMER_COOKIE,
    await createCustomerSessionToken(phone),
    customerSessionCookieOptions()
  );
}

export { CUSTOMER_COOKIE, parseCustomerSessionToken };

export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

export async function getCustomerSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  return parseCustomerSessionToken(cookieStore.get(CUSTOMER_COOKIE)?.value);
}
