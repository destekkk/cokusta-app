import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { bulkAdminQuoteAction } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = body.ids as string[] | undefined;
    const action = body.action as "approve" | "reject" | "match" | undefined;
    const providerId = body.providerId as string | undefined;

    if (!ids?.length) {
      return NextResponse.json({ error: "En az bir talep seçin." }, { status: 400 });
    }

    if (!action || !["approve", "reject", "match"].includes(action)) {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    if (action === "match" && !providerId) {
      return NextResponse.json({ error: "Eşleştirme için usta seçin." }, { status: 400 });
    }

    const result = await bulkAdminQuoteAction({ ids, action, providerId });
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Toplu işlem başarısız." }, { status: 500 });
  }
}
