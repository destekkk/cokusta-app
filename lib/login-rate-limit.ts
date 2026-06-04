import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_LIMIT = 15;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Giriş denemelerini IP bazlı sınırla; limit aşıldıysa 429 döner. */
export function loginRateLimitResponse(
  request: Request,
  scope: "admin" | "usta" | "musteri" | "mobile-usta",
): NextResponse | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(`login:${scope}:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSec) },
    },
  );
}
