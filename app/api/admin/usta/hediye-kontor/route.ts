import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isValidAdminGiftCreditAmount } from "@/lib/admin-gift-credits";
import { grantAdminGiftCreditsToProviders } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const credits = Number(body.credits);
    const allApproved = Boolean(body.allApproved);
    const providerIds = Array.isArray(body.providerIds)
      ? (body.providerIds as string[]).filter(Boolean)
      : [];
    const note = typeof body.note === "string" ? body.note : undefined;

    if (!isValidAdminGiftCreditAmount(credits)) {
      return NextResponse.json(
        { error: "Kontör miktarı 10, 30, 50 veya 100 olmalı." },
        { status: 400 }
      );
    }

    if (!allApproved && providerIds.length === 0) {
      return NextResponse.json(
        { error: "Tüm onaylı ustaları seçin veya listeden usta işaretleyin." },
        { status: 400 }
      );
    }

    const result = await grantAdminGiftCreditsToProviders({
      allApproved,
      providerIds,
      credits,
      note,
    });

    if (result.granted.length === 0 && result.failed.length > 0) {
      return NextResponse.json(
        { error: result.failed[0]?.error ?? "Kontör verilemedi.", ...result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      credits,
      totalGranted: result.granted.length,
      ...result,
    });
  } catch {
    return NextResponse.json({ error: "Hediye kontör verilemedi." }, { status: 500 });
  }
}
