import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db-status";
import {
  isAdminPasswordConfigured,
  isAdminSessionConfigured,
} from "@/lib/security-secrets";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await pingDatabase();
  const adminConfig = {
    password: isAdminPasswordConfigured(),
    sessionSecret: isAdminSessionConfigured(),
  };
  if (result.ok) {
    const adminOk = adminConfig.password && adminConfig.sessionSecret;
    return NextResponse.json({
      ok: adminOk,
      db: "connected",
      admin: adminConfig,
      ...(adminOk
        ? {}
        : {
            hint: "Vercel → Settings → Environment Variables: ADMIN_PASSWORD (min 8 karakter) ve ADMIN_SESSION_SECRET (min 32 karakter), sonra Redeploy.",
          }),
    });
  }
  return NextResponse.json(
    {
      ok: false,
      db: result.message?.includes("DATABASE_URL") ? "missing" : "error",
      message: result.message,
      hint: "Neon bağlantısı ve Vercel DATABASE_URL değerini kontrol edin.",
    },
    { status: 503 }
  );
}
