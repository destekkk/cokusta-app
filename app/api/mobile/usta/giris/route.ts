import { NextResponse } from "next/server";
import { findProviderByPhone, getProviderById } from "@/lib/db";
import { createProviderSessionToken } from "@/lib/provider-session";
import {
  isLoginPinFormat,
  isValidProviderPhone,
  loginPinFormatError,
  verifyProviderPin,
} from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    if (!pin || !isLoginPinFormat(String(pin))) {
      return NextResponse.json({ error: loginPinFormatError() }, { status: 400 });
    }

    const auth = await findProviderByPhone(String(phone));
    if (!auth) {
      return NextResponse.json(
        { error: "Bu telefon numarasıyla kayıt bulunamadı." },
        { status: 404 }
      );
    }

    if (auth.provider.status !== "approved") {
      const messages: Record<string, string> = {
        pending: "Başvurunuz henüz onaylanmadı.",
        rejected: "Başvurunuz reddedildi.",
      };
      return NextResponse.json(
        { error: messages[auth.provider.status] ?? "Hesap onaylı değil." },
        { status: 403 }
      );
    }

    if (!auth.pinHash) {
      return NextResponse.json(
        { error: "Önce web sitesinden giriş şifrenizi belirleyin.", code: "NO_PIN_SET" },
        { status: 403 }
      );
    }

    if (!verifyProviderPin(String(pin), auth.pinHash)) {
      return NextResponse.json({ error: "Telefon veya şifre hatalı." }, { status: 401 });
    }

    const fresh = await getProviderById(auth.provider.id);
    const token = await createProviderSessionToken(auth.provider.id);

    return NextResponse.json({
      token,
      provider: {
        id: auth.provider.id,
        name: auth.provider.name,
        city: auth.provider.city,
        categorySlugs: auth.provider.categorySlugs,
        creditBalance: fresh?.creditBalance ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
