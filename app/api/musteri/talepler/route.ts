import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { countQuoteRequestsByPhone, getQuoteOfferCounts, getQuoteRequestsByPhone } from "@/lib/db";

const statusLabels: Record<string, string> = {
  awaiting_review: "İnceleniyor",
  open: "Teklif bekleniyor",
  accepted: "Usta seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export async function GET(request: Request) {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

  const [quotes, total, offerCounts] = await Promise.all([
    getQuoteRequestsByPhone(phone, { limit, offset }),
    countQuoteRequestsByPhone(phone),
    getQuoteOfferCounts(),
  ]);

  return NextResponse.json({
    phone,
    total,
    limit,
    offset,
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
