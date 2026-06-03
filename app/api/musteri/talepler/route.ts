import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import {
  countCustomerQuotesByPhone,
  getCustomerQuoteTabCounts,
  getQuoteOfferCounts,
  getQuoteRequestsByPhone,
} from "@/lib/db";
import type { CustomerQuoteTab } from "@/lib/customer-quotes-filter";

const statusLabels: Record<string, string> = {
  awaiting_review: "İnceleniyor",
  open: "Teklif bekleniyor",
  accepted: "Usta seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

function parseTab(value: string | null): CustomerQuoteTab | undefined {
  if (value === "waiting" || value === "offers" || value === "negotiating" || value === "finished") {
    return value;
  }
  return undefined;
}

export async function GET(request: Request) {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const tab = parseTab(searchParams.get("tab"));
  const search = searchParams.get("q")?.trim() || undefined;
  const city = searchParams.get("city")?.trim() || undefined;
  const district = searchParams.get("district")?.trim() || undefined;

  const listFilter = { limit, offset, tab, search, city, district };
  const countFilter = { tab, search, city, district };
  const locationFilter = { city, district, search };

  const [quotes, total, tabCounts, offerCounts] = await Promise.all([
    getQuoteRequestsByPhone(phone, listFilter),
    countCustomerQuotesByPhone(phone, countFilter),
    getCustomerQuoteTabCounts(phone, locationFilter),
    getQuoteOfferCounts(),
  ]);

  return NextResponse.json({
    phone,
    total,
    limit,
    offset,
    tab: tab ?? "all",
    tabCounts,
    quotes: quotes.map((quote) => ({
      id: quote.id,
      serviceName: quote.serviceName,
      city: quote.city,
      district: quote.district,
      status: quote.status,
      statusLabel: statusLabels[quote.status] ?? quote.status,
      createdAt: quote.createdAt,
      offerCount: offerCounts[quote.id] ?? 0,
      matchedProviderName: quote.matchedProviderName,
      urgent: quote.urgent ?? false,
    })),
  });
}
