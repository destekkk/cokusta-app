import { NextResponse } from "next/server";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";
import { startProviderCreditCheckout } from "@/lib/provider-credit-checkout";
import { getShopPackage } from "@/lib/credit-packages";

/**
 * Lemon Squeezy checkout başlatır.
 * Body: { packageSlug, orderType?: "provider_credit", userId?: string }
 */
export async function POST(request: Request) {
  let packageSlug = "";
  let orderType = "provider_credit";
  let bodyUserId = "";

  try {
    const body = await request.json();
    packageSlug = String(body.packageSlug ?? "").trim();
    orderType = String(body.orderType ?? "provider_credit").trim();
    bodyUserId = String(body.userId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!packageSlug) {
    return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
  }

  if (orderType !== "provider_credit") {
    return NextResponse.json({ error: "Desteklenmeyen sipariş tipi." }, { status: 400 });
  }

  if (!getShopPackage(packageSlug)) {
    return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
  }

  const providerId =
    (await getProviderSessionIdFromRequest(request)) ?? (await getProviderSessionId());
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (bodyUserId && bodyUserId !== providerId) {
    return NextResponse.json({ error: "Geçersiz kullanıcı." }, { status: 403 });
  }

  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const started = await startProviderCreditCheckout(providerId, packageSlug, {
    accessToken: auth,
  });

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
