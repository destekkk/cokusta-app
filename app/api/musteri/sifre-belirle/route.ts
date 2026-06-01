import { NextResponse } from "next/server";
import { getCustomerAuthByPhone, setCustomerPinIfUnset } from "@/lib/customer-pin";
import { isValidProviderPhone, normalizeProviderPhone, validateProviderPin } from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const { phone, pin, pinConfirm } = await request.json();

    if (!phone || !isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    const pinCheck = validateProviderPin(String(pin ?? ""));
    if (!pinCheck.ok) {
      return NextResponse.json({ error: pinCheck.error }, { status: 400 });
    }

    if (pin !== pinConfirm) {
      return NextResponse.json({ error: "Şifreler eşleşmiyor." }, { status: 400 });
    }

    const normalized = normalizeProviderPhone(String(phone));
    const auth = await getCustomerAuthByPhone(normalized);
    if (auth.quoteCount === 0) {
      return NextResponse.json(
        { error: "Bu telefon numarasıyla kayıtlı teklif talebi bulunamadı." },
        { status: 404 }
      );
    }

    if (auth.pinHash) {
      return NextResponse.json({ error: "Giriş şifreniz zaten tanımlı. Giriş yapın." }, { status: 409 });
    }

    const saved = await setCustomerPinIfUnset(normalized, String(pin));
    if (!saved) {
      return NextResponse.json({ error: "Şifre kaydedilemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Şifre belirlenemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
