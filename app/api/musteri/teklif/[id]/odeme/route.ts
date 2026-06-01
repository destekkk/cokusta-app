import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { payProviderWithCustomerCredits } from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const { id: quoteId } = await params;

  try {
    const body = await request.json();
    const offerId = body.offerId as string;
    if (!offerId) {
      return NextResponse.json({ error: "Teklif seçin." }, { status: 400 });
    }

    const result = await payProviderWithCustomerCredits({
      customerPhone: phone,
      quoteId,
      offerId,
    });

    if (result.error) {
      const status =
        result.code === "INSUFFICIENT_CREDITS" ? 402 : result.code === "ALREADY_PAID" ? 409 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status }
      );
    }

    return NextResponse.json({ success: true, payment: result.payment });
  } catch {
    return NextResponse.json({ error: "Ödeme yapılamadı." }, { status: 500 });
  }
}
