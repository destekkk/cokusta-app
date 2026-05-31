import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { autoMatchQuotes } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids = body.ids as string[] | undefined;

    if (!ids?.length) {
      return NextResponse.json({ error: "En az bir talep seçin." }, { status: 400 });
    }

    const result = await autoMatchQuotes(ids);
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Otomatik eşleştirme başarısız." }, { status: 500 });
  }
}
