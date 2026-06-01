import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";
import type { ProviderQuoteLocationFilter } from "@/lib/offer-utils";

export async function GET(request: Request) {
  const providerId = await getProviderSessionIdFromRequest(request);
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const url = new URL(request.url);
  const district = url.searchParams.get("district")?.trim();
  if (!district) {
    return NextResponse.json({ error: "İlçe seçimi gerekli." }, { status: 400 });
  }

  const location: ProviderQuoteLocationFilter = {
    cityMode: "provider",
    selectedDistrict: district,
  };

  const quotes = await getOpenQuotesForProvider(providerId, location);

  return NextResponse.json({
    quotes,
    district,
    city: provider.city,
    creditBalance: provider.creditBalance ?? 0,
  });
}
