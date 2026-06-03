import { NextResponse } from "next/server";
import { findProviderByPhone } from "@/lib/db";
import { setProviderSession } from "@/lib/provider-auth";
import { isValidProviderPhone, verifyProviderPin } from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    if (!pin || !/^\d{4}$/.test(String(pin))) {
      return NextResponse.json({ error: "4 haneli giriş şifrenizi girin." }, { status: 400 });
    }

    const auth = await findProviderByPhone(String(phone));
    if (!auth) {
      return NextResponse.json(
        { error: "Bu telefon numarasıyla kayıt bulunamadı." },
        { status: 404 }
      );
    }

    if (auth.provider.status === "pending") {
      return NextResponse.json(
        {
          error: "Başvurunuz henüz onaylanmadı. Onay e-postası/SMS sonrası giriş yapabilirsiniz.",
          code: "PENDING_APPROVAL",
        },
        { status: 403 }
      );
    }

    if (auth.provider.status === "rejected") {
      return NextResponse.json(
        {
          error: "Başvurunuz reddedildi. Detaylar için destek ile iletişime geçin.",
          code: "REJECTED",
        },
        { status: 403 }
      );
    }

    if (auth.provider.status !== "approved") {
      return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
    }

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

    await setProviderSession(auth.provider.id);
    return NextResponse.json({
      success: true,
      provider: {
        id: auth.provider.id,
        name: auth.provider.name,
        city: auth.provider.city,
        creditBalance: auth.provider.creditBalance ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
