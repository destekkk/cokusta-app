import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  approveProviderPayout,
  getCreditLedgerEntries,
  getCreditSettlementSummary,
  getPendingProviderPayouts,
  markProviderPayoutPaid,
  rejectProviderPayout,
} from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const [summary, payouts, ledger] = await Promise.all([
    getCreditSettlementSummary(),
    getPendingProviderPayouts(),
    getCreditLedgerEntries(50),
  ]);

  return NextResponse.json({ summary, payouts, ledger });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { action, payoutId, note } = body as {
      action: "approve" | "pay" | "reject";
      payoutId: string;
      note?: string;
    };

    if (!payoutId || !action) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    let result;
    if (action === "approve") result = await approveProviderPayout(payoutId);
    else if (action === "pay") result = await markProviderPayoutPaid(payoutId);
    else if (action === "reject") result = await rejectProviderPayout(payoutId, note);
    else return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, request: result?.request });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
