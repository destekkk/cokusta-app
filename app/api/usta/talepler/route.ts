import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";

import { MAX_CREDIT_DEBT } from "@/lib/credit-debt";

export async function GET() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const quotes = await getOpenQuotesForProvider(providerId);
  const creditDebt = provider.creditDebt ?? 0;
  return NextResponse.json({
    quotes,
    creditBalance: provider.creditBalance ?? 0,
    creditDebt,
    maxCreditDebt: MAX_CREDIT_DEBT,
    canUseDebt: creditDebt < MAX_CREDIT_DEBT,
  });
}
