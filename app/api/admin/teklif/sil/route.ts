import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminMutationJson } from "@/lib/admin-api-response";
import { deleteRejectedQuoteRequest } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "En az bir talep seçin." }, { status: 400 });
    }

    const succeeded: string[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const id of ids) {
      const ok = await deleteRejectedQuoteRequest(id);
      if (ok) succeeded.push(id);
      else failed.push({ id, error: "Reddedilmiş değil veya bulunamadı" });
    }

    return adminMutationJson({ succeeded, failed });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
