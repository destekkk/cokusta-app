import { NextResponse } from "next/server";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getProviderById } from "@/lib/db";
import {
  createProviderPayoutRequest,
  getProviderPayoutRequests,
} from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";
import { PAYOUT_FEE_RATE } from "@/lib/credit-economy";

export async function GET() {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  const requests = await getProviderPayoutRequests(providerId);

  return NextResponse.json({
    creditBalance: provider?.creditBalance ?? 0,
    creditDebt: provider?.creditDebt ?? 0,
    iban: provider?.iban,
    accountHolder: provider?.accountHolder,
    payoutFeeRate: PAYOUT_FEE_RATE,
    requests,
  });
}

export async function POST(request: Request) {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const credits = Number(body.credits);
    if (!credits || credits < 1) {
      return NextResponse.json({ error: "Geçerli kontör miktarı girin." }, { status: 400 });
    }

    const result = await createProviderPayoutRequest(providerId, credits, {
      iban: body.iban,
      accountHolder: body.accountHolder,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, request: result.request });
  } catch {
    return NextResponse.json({ error: "Talep oluşturulamadı." }, { status: 500 });
  }
}
