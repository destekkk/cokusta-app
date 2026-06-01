import { NextResponse } from "next/server";
import { getQuoteRequestsByPhone, findProviderByPhone } from "@/lib/db";
import { setCustomerSession } from "@/lib/customer-auth";
import { isValidProviderPhone, normalizeProviderPhone } from "@/lib/phone-utils";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    const normalized = normalizeProviderPhone(String(phone));
    const quotes = await getQuoteRequestsByPhone(normalized);

    if (quotes.length === 0) {
      const provider = await findProviderByPhone(normalized);
      if (provider) {
        return NextResponse.json(
          {
            error:
              "Bu numarayla müşteri talebi bulunamadı. Usta hesabınız varsa usta girişinden devam edin.",
            code: "PROVIDER_ACCOUNT",
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Bu telefon numarasıyla kayıtlı teklif talebi bulunamadı. Önce teklif al formunu doldurun.",
        },
        { status: 404 }
      );
    }

    await setCustomerSession(normalized);

    return NextResponse.json({
      success: true,
      quoteCount: quotes.length,
      name: quotes[0]?.name,
    });
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
