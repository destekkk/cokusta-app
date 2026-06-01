import { NextResponse } from "next/server";
import { updateQuoteRequestLocation } from "@/lib/db";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { hasCustomerQuoteAccess } from "@/lib/customer-quote-auth";
import { getQuoteRequestById } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const quote = await getQuoteRequestById(id);
  if (!quote) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const verified = await hasCustomerQuoteAccess(id, quote.phone);
  if (!verified) {
    return NextResponse.json({ error: "Telefon doğrulaması gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const city = String(body.city ?? "").trim();
    const district = String(body.district ?? "").trim();
    const result = await updateQuoteRequestLocation(id, phone, { city, district });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      quote: {
        id: result.quote!.id,
        city: result.quote!.city,
        district: result.quote!.district,
        status: result.quote!.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Konum güncellenemedi." }, { status: 500 });
  }
}
