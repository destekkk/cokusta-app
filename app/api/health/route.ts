import { NextResponse } from "next/server";
import { isDatabaseEnabled } from "@/lib/db/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbConfigured = isDatabaseEnabled();

  if (!dbConfigured) {
    return NextResponse.json({
      ok: false,
      db: "missing",
      message: "DATABASE_URL tanımlı değil — Vercel ortam değişkenlerini kontrol edin.",
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bağlantı hatası";
    return NextResponse.json(
      {
        ok: false,
        db: "error",
        message,
        hint: "Neon bağlantısı ve `npx prisma db push` ile şema senkronunu kontrol edin.",
      },
      { status: 503 }
    );
  }
}
