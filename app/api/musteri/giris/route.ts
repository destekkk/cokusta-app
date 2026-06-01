import { NextResponse } from "next/server";
import { getQuoteRequestsByPhone, findProviderByPhone } from "@/lib/db";
import { attachCustomerSessionCookie } from "@/lib/customer-auth";
import { getCustomerAuthByPhone } from "@/lib/customer-pin";
import { isValidProviderPhone, normalizeProviderPhone, verifyProviderPin } from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    if (!pin || !/^\d{4}$/.test(String(pin))) {
      return NextResponse.json({ error: "4 haneli giriş şifrenizi girin." }, { status: 400 });
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

    const auth = await getCustomerAuthByPhone(normalized);
    if (!auth.pinHash) {
      return NextResponse.json(
        {
          error: "Giriş şifreniz henüz tanımlı değil. Aşağıdan şifre belirleyin.",
          code: "NO_PIN_SET",
        },
        { status: 403 }
      );
    }

    if (!verifyProviderPin(String(pin), auth.pinHash)) {
      return NextResponse.json({ error: "Telefon veya şifre hatalı." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      quoteCount: quotes.length,
      name: quotes[0]?.name,
    });
    await attachCustomerSessionCookie(response, normalized);
    return response;
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
