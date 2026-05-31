import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/admin-session";
import { PROVIDER_COOKIE, getProviderSessionFromToken } from "@/lib/provider-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/usta/teklifler")) {
    const token = request.cookies.get(PROVIDER_COOKIE)?.value;
    const session = await getProviderSessionFromToken(token);
    if (!session) {
      const loginUrl = new URL("/usta/giris", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/usta/teklifler"],
};
