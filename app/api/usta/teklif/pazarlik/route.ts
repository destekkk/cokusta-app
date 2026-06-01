import { NextResponse } from "next/server";
import { agreeToOffer, counterOffer } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";

export async function POST(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { offerId, action, price, message } = body;

    if (!offerId) {
      return NextResponse.json({ error: "Teklif seçilmedi." }, { status: 400 });
    }

    if (action === "agree") {
      const result = await agreeToOffer(String(offerId), "provider", providerId);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result);
    }

    if (action === "counter") {
      const result = await counterOffer(
        String(offerId),
        "provider",
        Number(price),
        String(message ?? ""),
        providerId
      );
      if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
