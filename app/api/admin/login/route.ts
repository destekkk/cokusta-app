import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/admin-auth";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || !verifyPassword(String(password))) {
      return NextResponse.json({ error: "Geçersiz şifre." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
