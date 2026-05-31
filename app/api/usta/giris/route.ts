import { NextResponse } from "next/server";
import { findApprovedProviderByPhone, getProviderById } from "@/lib/db";
import { normalizePhone, setProviderSession } from "@/lib/provider-auth";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone || normalizePhone(String(phone)).length < 10) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    const provider = await findApprovedProviderByPhone(String(phone));
    if (!provider) {
      return NextResponse.json(
        { error: "Onaylı usta bulunamadı. Kayıt veya onay bekliyor olabilir." },
        { status: 404 }
      );
    }

    await setProviderSession(provider.id);
    const fresh = await getProviderById(provider.id);
    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        city: provider.city,
        creditBalance: fresh?.creditBalance ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Giriş başarısız." }, { status: 500 });
  }
}
