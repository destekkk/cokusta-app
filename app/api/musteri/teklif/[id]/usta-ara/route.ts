import { NextResponse } from "next/server";
import { getQuoteRequestById, recordCustomerInitiatedContact } from "@/lib/db";
import { hasCustomerQuoteAccess } from "@/lib/customer-quote-auth";
import { sanitizeOfferForCustomer } from "@/lib/quote-privacy";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const verified = await hasCustomerQuoteAccess(id, quote.phone);
  if (!verified) {
    return NextResponse.json({ error: "Telefon doğrulaması gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const offerId = String(body.offerId ?? "").trim();
  if (!offerId) {
    return NextResponse.json({ error: "Teklif seçilmedi." }, { status: 400 });
  }

  const result = await recordCustomerInitiatedContact(id, offerId, quote.phone);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    offer: result.offer ? sanitizeOfferForCustomer(result.offer) : null,
  });
}
