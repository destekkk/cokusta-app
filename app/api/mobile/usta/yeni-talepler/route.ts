import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";
import type { ProviderQuoteLocationFilter } from "@/lib/offer-utils";

/** İlçe bazlı yeni talep kontrolü — mobil uygulama periyodik poll eder. */
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

  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(0);
  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "Geçersiz since parametresi." }, { status: 400 });
  }

  const location: ProviderQuoteLocationFilter = {
    cityMode: "provider",
    selectedDistrict: district,
  };

  const quotes = await getOpenQuotesForProvider(providerId, location);
  const fresh = quotes.filter((quote) => new Date(quote.createdAt) > since);

  return NextResponse.json({
    newQuotes: fresh.map((q) => ({
      id: q.id,
      serviceName: q.serviceName,
      city: q.city,
      district: q.district,
      urgent: q.urgent,
      createdAt: q.createdAt,
      offerCount: q.offerCount ?? 0,
    })),
    serverTime: new Date().toISOString(),
    district,
    city: provider.city,
  });
}
