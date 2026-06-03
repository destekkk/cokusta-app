import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteRejectedQuoteRequest, getQuoteRequestById, updateQuoteRequestStatus } from "@/lib/db";
import type { QuoteRequest } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as QuoteRequest["status"];
    const jobValue = body.jobValue as number | undefined;
    const matchedProviderId = body.matchedProviderId as string | undefined;
    const matchedProviderName = body.matchedProviderName as string | undefined;

    const valid: QuoteRequest["status"][] = [
      "awaiting_review",
      "open",
      "accepted",
      "completed",
      "cancelled",
    ];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    const existing = await getQuoteRequestById(id);
    if (!existing) {
      return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
    }
    if (
      status === "cancelled" &&
      existing.status !== "awaiting_review" &&
      existing.status !== "open"
    ) {
      return NextResponse.json(
        { error: "Bu talep reddedilemez veya iptal edilemez." },
        { status: 400 }
      );
    }

    if (status === "completed" && (!jobValue || jobValue <= 0)) {
      return NextResponse.json(
        { error: "Tamamlanan iş için iş tutarı girilmeli." },
        { status: 400 }
      );
    }

    const updated = await updateQuoteRequestStatus(id, status, {
      jobValue,
      matchedProviderId,
      matchedProviderName,
    });
    if (!updated) {
      return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteRejectedQuoteRequest(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Sadece reddedilmiş talepler silinebilir." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
