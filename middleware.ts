import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/admin-session";
import { PROVIDER_COOKIE, getProviderSessionFromToken } from "@/lib/provider-session";
import { CUSTOMER_COOKIE, getCustomerSessionFromToken } from "@/lib/customer-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/usta/kontor/sonuc")) return NextResponse.next();
  if (pathname.startsWith("/musteri/kontor/sonuc")) return NextResponse.next();

  if (
    pathname.startsWith("/usta/teklifler") ||
    pathname.startsWith("/usta/kontor") ||
    pathname.startsWith("/usta/odeme-talep")
  ) {
    const token = request.cookies.get(PROVIDER_COOKIE)?.value;
    const session = await getProviderSessionFromToken(token);
    if (!session) {
      const loginUrl = new URL("/usta/giris", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/musteri/teklifler") || pathname.startsWith("/musteri/kontor")) {
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
    const session = await getCustomerSessionFromToken(token);
    if (!session) {
      const loginUrl = new URL("/musteri/giris", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/sltn")) return NextResponse.next();

  if (pathname === "/sltn" || pathname === "/sltn/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) {
    const loginUrl = new URL("/sltn", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sltn",
    "/sltn/:path*",
    "/usta/teklifler",
    "/usta/kontor",
    "/usta/odeme-talep",
    "/musteri/teklifler",
    "/musteri/kontor",
  ],
};
