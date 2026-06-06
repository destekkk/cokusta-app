import { NextResponse } from "next/server";
import { getProviderSessionId } from "@/lib/provider-auth";
import { startProviderCreditCheckout } from "@/lib/provider-credit-checkout";

/** Web usta paneli — kontör checkout (Lemon Squeezy veya manuel akış). */
export async function POST(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let packageSlug = "";
  try {
    const body = await request.json();
    packageSlug = String(body.packageSlug ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!packageSlug) {
    return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
  }

  const started = await startProviderCreditCheckout(providerId, packageSlug);
  if (started.error || !started.result) {
    return NextResponse.json(
      { error: started.error ?? "Ödeme başlatılamadı." },
      { status: 400 },
    );
  }

  const { result } = started;
  return NextResponse.json({
    orderId: result.orderId,
    packageName: result.packageName,
    amount: result.amount,
    mode: result.mode,
    checkoutUrl: result.checkoutUrl,
    url: result.checkoutUrl,
  });
}
