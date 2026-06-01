import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
import type { ProviderQuoteScope } from "@/lib/offer-utils";

import { MAX_CREDIT_DEBT } from "@/lib/credit-debt";

export async function GET(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const scopeParam = new URL(request.url).searchParams.get("scope");
  const scope: ProviderQuoteScope = scopeParam === "all" ? "all" : "city";

  const quotes = await getOpenQuotesForProvider(providerId, scope);
  const creditDebt = provider.creditDebt ?? 0;
  return NextResponse.json({
    quotes,
    scope,
    creditBalance: provider.creditBalance ?? 0,
    creditDebt,
    maxCreditDebt: MAX_CREDIT_DEBT,
    canUseDebt: creditDebt < MAX_CREDIT_DEBT,
    providerCity: provider.city,
    providerCategories: provider.categorySlugs,
  });
}
