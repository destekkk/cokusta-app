import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
import {
  parseProviderQuoteLocationFilter,
  type ProviderQuoteLocationFilter,
} from "@/lib/offer-utils";

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

  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope");
  let location: ProviderQuoteLocationFilter;
  if (scopeParam === "all") {
    location = { cityMode: "all" };
  } else {
    location = parseProviderQuoteLocationFilter(
      {
        city: url.searchParams.get("city"),
        district: url.searchParams.get("district"),
      },
      provider.city
    );
  }

  const quotes = await getOpenQuotesForProvider(providerId, location);
  const creditDebt = provider.creditDebt ?? 0;
  return NextResponse.json({
    quotes,
    location,
    creditBalance: provider.creditBalance ?? 0,
    creditDebt,
    borcKredisiAktif: provider.borcKredisiAktif ?? false,
    maxCreditDebt: MAX_CREDIT_DEBT,
    canUseDebt: creditDebt < MAX_CREDIT_DEBT,
    providerCity: provider.city,
    providerDistrict: provider.district ?? "",
    providerCategories: provider.categorySlugs,
    escrowBalanceTl: provider.escrowBalanceTl ?? 0,
  });
}
