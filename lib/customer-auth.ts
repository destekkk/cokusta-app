import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionToken,
  parseCustomerSessionToken,
} from "@/lib/customer-session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export { CUSTOMER_COOKIE, parseCustomerSessionToken };

export async function setCustomerSession(phone: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, await createCustomerSessionToken(phone), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

export async function getCustomerSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  return parseCustomerSessionToken(cookieStore.get(CUSTOMER_COOKIE)?.value);
}
