import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminMutationJson } from "@/lib/admin-api-response";
import { getProviderById, updateProviderStatus } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    const action = body.action as "approve" | "reject";

    if (ids.length === 0) {
      return NextResponse.json({ error: "En az bir başvuru seçin." }, { status: 400 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "rejected";
    const succeeded: string[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const id of ids) {
      try {
        const existing = await getProviderById(id);
        if (!existing) {
          failed.push({ id, error: "Bulunamadı" });
          continue;
        }
        if (existing.status !== "pending") {
          failed.push({ id, error: "Sadece bekleyen başvurular işlenebilir." });
          continue;
        }
        const updated = await updateProviderStatus(id, status, body.rejectionReason);
        if (updated) succeeded.push(id);
        else failed.push({ id, error: "Güncellenemedi" });
      } catch {
        failed.push({ id, error: "Güncellenemedi" });
      }
    }

    return adminMutationJson({ succeeded, failed });
  } catch {
    return NextResponse.json({ error: "Toplu işlem başarısız." }, { status: 500 });
  }
}
