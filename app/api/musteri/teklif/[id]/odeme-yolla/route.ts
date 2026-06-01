import { NextResponse } from "next/server";
import { releaseEscrowToProvider } from "@/lib/db-escrow";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { hasCustomerQuoteAccess } from "@/lib/customer-quote-auth";
import { getQuoteRequestById } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Props) {
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

  const result = await releaseEscrowToProvider(id, phone);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ escrow: result.order });
}
