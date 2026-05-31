import { NextResponse } from "next/server";
import {
  getAcceptedContactDetails,
  getOffersForQuoteRequest,
  getQuoteRequestById,
} from "@/lib/db";
import { hasCustomerQuoteAccess } from "@/lib/customer-quote-auth";
import { sanitizeOfferForCustomer } from "@/lib/quote-privacy";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const verified = await hasCustomerQuoteAccess(id, quote.phone);
  if (!verified) {
    return NextResponse.json({ error: "Telefon doğrulaması gerekli." }, { status: 401 });
  }

  const offers = (await getOffersForQuoteRequest(id)).map(sanitizeOfferForCustomer);
  const contacts =
    quote.status === "accepted" ? await getAcceptedContactDetails(id) : null;

  return NextResponse.json({
    quote: {
      id: quote.id,
      serviceName: quote.serviceName,
      city: quote.city,
      district: quote.district,
      status: quote.status,
      createdAt: quote.createdAt,
    },
    offers,
    contacts,
  });
}
