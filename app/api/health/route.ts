import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await pingDatabase();
  if (result.ok) {
    return NextResponse.json({ ok: true, db: "connected" });
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
