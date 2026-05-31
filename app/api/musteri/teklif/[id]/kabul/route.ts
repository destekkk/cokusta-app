import { NextResponse } from "next/server";
import { acceptProviderOffer, getQuoteRequestById } from "@/lib/db";
import { hasCustomerQuoteAccess } from "@/lib/customer-quote-auth";

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

  try {
    const { offerId } = await request.json();
    if (!offerId) {
      return NextResponse.json({ error: "Teklif seçilmedi." }, { status: 400 });
    }

    const result = await acceptProviderOffer(id, String(offerId));
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, quote: result.quote });
  } catch {
    return NextResponse.json({ error: "Kabul işlemi başarısız." }, { status: 500 });
  }
}
