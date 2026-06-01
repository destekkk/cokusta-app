import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { getQuoteOfferCounts, getQuoteRequestsByPhone } from "@/lib/db";

const statusLabels: Record<string, string> = {
  awaiting_review: "İnceleniyor",
  open: "Teklif bekleniyor",
  accepted: "Usta seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export async function GET() {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const [quotes, offerCounts] = await Promise.all([
    getQuoteRequestsByPhone(phone),
    getQuoteOfferCounts(),
  ]);

  return NextResponse.json({
    phone,
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
