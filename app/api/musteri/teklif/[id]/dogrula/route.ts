import { NextResponse } from "next/server";
import { getQuoteRequestById } from "@/lib/db";
import {
  hasCustomerQuoteAccess,
  phonesMatch,
  setCustomerQuoteAccess,
} from "@/lib/customer-quote-auth";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const { phone } = await request.json();
    const quote = await getQuoteRequestById(id);

    if (!quote) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }
    if (!phonesMatch(quote.phone, String(phone ?? ""))) {
      return NextResponse.json({ error: "Telefon numarası eşleşmiyor." }, { status: 401 });
    }

    await setCustomerQuoteAccess(id, quote.phone);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Doğrulama başarısız." }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const ok = await hasCustomerQuoteAccess(id, quote.phone);
  return NextResponse.json({ verified: ok });
}
