import { NextResponse } from "next/server";
import { agreeToOffer, counterOffer, getQuoteRequestById, withdrawCustomerAgreement } from "@/lib/db";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { phonesEqual } from "@/lib/phone-utils";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const sessionPhone = await getCustomerSessionPhone();
    if (!sessionPhone) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    const quote = await getQuoteRequestById(id);
    if (!quote || !phonesEqual(sessionPhone, quote.phone)) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const { offerId, action, price, message } = body;

    if (!offerId) {
      return NextResponse.json({ error: "Teklif seçilmedi." }, { status: 400 });
    }

    if (action === "agree") {
      const result = await agreeToOffer(String(offerId), "customer");
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result);
    }

    if (action === "counter") {
      const result = await counterOffer(String(offerId), "customer", Number(price), String(message ?? ""));
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result);
    }

    if (action === "withdraw") {
      const result = await withdrawCustomerAgreement(String(offerId), sessionPhone);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
