import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import {
  createCustomerCreditPurchaseOrder,
  setCustomerCreditPurchaseToken,
} from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";
import { initializeCreditCheckout } from "@/lib/iyzico/client";
import { getIyzicoCallbackUrl, getIyzicoConfig } from "@/lib/iyzico/config";
import { getQuoteRequestsByPhone } from "@/lib/db";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  return "127.0.0.1";
}

export async function POST(request: Request) {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  if (!getIyzicoConfig().configured) {
    return NextResponse.json({ error: "Ödeme sistemi yapılandırılmamış." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const packageSlug = body.packageSlug as string;
    if (!packageSlug) {
      return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
    }

    const quotes = await getQuoteRequestsByPhone(phone);
    const buyerName = quotes[0]?.name ?? "Müşteri";
    const buyerEmail = quotes[0]?.email || "musteri@cokusta.com";
    const buyerCity = quotes[0]?.city ?? "İstanbul";

    const { order, error } = await createCustomerCreditPurchaseOrder(phone, packageSlug);
    if (error || !order) {
      return NextResponse.json({ error: error ?? "Sipariş oluşturulamadı." }, { status: 400 });
    }

    const checkout = await initializeCreditCheckout({
      conversationId: order.conversationId,
      basketId: order.basketId,
      packageName: order.packageName,
      packageSlug: order.packageSlug,
      price: order.amount,
      packageAmount: order.amount,
      debtCredits: 0,
      debtAmount: 0,
      callbackUrl: getIyzicoCallbackUrl(),
      buyer: {
        id: order.walletId,
        name: buyerName,
        email: buyerEmail,
        phone,
        city: buyerCity,
        ip: clientIp(request),
      },
    });

    await setCustomerCreditPurchaseToken(order.id, checkout.token);

    return NextResponse.json({
      orderId: order.id,
      token: checkout.token,
      checkoutFormContent: checkout.checkoutFormContent,
      totalAmount: order.amount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ödeme başlatılamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
