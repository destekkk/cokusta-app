import { NextResponse } from "next/server";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getProviderById, createCreditPurchaseOrder, setCreditPurchaseToken } from "@/lib/db";
import { initializeCreditCheckout } from "@/lib/iyzico/client";
import { getIyzicoCallbackUrl, getIyzicoConfig } from "@/lib/iyzico/config";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  return "127.0.0.1";
}

export async function POST(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  if (!getIyzicoConfig().configured) {
    return NextResponse.json(
      { error: "Ödeme sistemi yapılandırılmamış. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const packageSlug = body.packageSlug as string;
    if (!packageSlug) {
      return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
    }

    const provider = await getProviderById(providerId);
    if (!provider || provider.status !== "approved") {
      return NextResponse.json({ error: "Usta hesabı onaylı değil." }, { status: 403 });
    }

    const { order, error } = await createCreditPurchaseOrder(providerId, packageSlug);
    if (error || !order) {
      return NextResponse.json({ error: error ?? "Sipariş oluşturulamadı." }, { status: 400 });
    }

    const checkout = await initializeCreditCheckout({
      conversationId: order.conversationId,
      basketId: order.basketId,
      packageName: order.packageName,
      packageSlug: order.packageSlug,
      price: order.amount,
      callbackUrl: getIyzicoCallbackUrl(),
      buyer: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        city: provider.city,
        ip: clientIp(request),
      },
    });

    await setCreditPurchaseToken(order.id, checkout.token);

    return NextResponse.json({
      orderId: order.id,
      token: checkout.token,
      checkoutFormContent: checkout.checkoutFormContent,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ödeme başlatılamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
