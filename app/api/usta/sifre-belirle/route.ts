import { NextResponse } from "next/server";
import { findProviderByPhone, setProviderPinIfUnset } from "@/lib/db";
import { hashProviderPin, isValidProviderPhone, validateNewPin } from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin, pinConfirm } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    const pinCheck = validateNewPin(String(pin ?? ""));
    if (!pinCheck.ok) {
      return NextResponse.json({ error: pinCheck.error }, { status: 400 });
    }

    if (String(pin) !== String(pinConfirm ?? "")) {
      return NextResponse.json({ error: "Şifreler eşleşmiyor." }, { status: 400 });
    }

    const auth = await findProviderByPhone(String(phone));
    if (!auth) {
      return NextResponse.json({ error: "Bu telefon numarasıyla kayıt bulunamadı." }, { status: 404 });
    }

    if (auth.provider.status === "pending") {
      return NextResponse.json(
        {
          error: "Hesabınız henüz onaylanmadı. Onay sonrası giriş şifresi belirleyebilirsiniz.",
          code: "PENDING_APPROVAL",
        },
        { status: 403 }
      );
    }

    if (auth.provider.status !== "approved") {
      return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
    }

    if (auth.pinHash) {
      return NextResponse.json(
        { error: "Bu hesap için giriş şifresi zaten tanımlı. Giriş yapın." },
        { status: 409 }
      );
    }

    const pinHash = hashProviderPin(String(pin));
    const saved = await setProviderPinIfUnset(auth.provider.id, pinHash);
    if (!saved) {
      return NextResponse.json({ error: "Şifre kaydedilemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Şifre belirlenemedi." }, { status: 500 });
  }
}
