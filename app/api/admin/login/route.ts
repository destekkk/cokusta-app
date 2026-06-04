import { NextResponse } from "next/server";
import {
  verifyPassword,
  isAdminPasswordConfigured,
  isAdminSessionConfigured,
} from "@/lib/admin-auth";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/admin-session";
import { loginRateLimitResponse } from "@/lib/login-rate-limit";

export async function POST(request: Request) {
  const limited = loginRateLimitResponse(request, "admin");
  if (limited) return limited;

  if (!isAdminPasswordConfigured() || !isAdminSessionConfigured()) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik. Yönetici ile iletişime geçin." },
      { status: 503 },
    );
  }

  try {
    const { password } = await request.json();

    if (!password || !verifyPassword(String(password))) {
      return NextResponse.json({ error: "Geçersiz şifre." }, { status: 401 });
    }

    const token = await createSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "Oturum oluşturulamadı." },
        { status: 503 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
