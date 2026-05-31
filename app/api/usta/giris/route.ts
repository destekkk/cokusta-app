import { NextResponse } from "next/server";
import { getProviderById, getApprovedProviderAuthByPhone } from "@/lib/db";
import { setProviderSession } from "@/lib/provider-auth";
import {
  hashProviderPin,
  isValidProviderPhone,
  normalizeProviderPhone,
  validateProviderPin,
  verifyProviderPin,
} from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    if (!pin || !/^\d{4}$/.test(String(pin))) {
      return NextResponse.json({ error: "4 haneli giriş şifrenizi girin." }, { status: 400 });
    }

    const auth = await getApprovedProviderAuthByPhone(String(phone));
    if (!auth) {
      return NextResponse.json(
        { error: "Onaylı usta bulunamadı. Kayıt veya onay bekliyor olabilir." },
        { status: 404 }
      );
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
    const fresh = await getProviderById(auth.provider.id);
    return NextResponse.json({
      success: true,
      provider: {
        id: auth.provider.id,
        name: auth.provider.name,
        city: auth.provider.city,
        creditBalance: fresh?.creditBalance ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
