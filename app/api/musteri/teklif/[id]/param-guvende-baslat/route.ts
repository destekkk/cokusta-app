import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { getQuoteRequestById } from "@/lib/db";
import { isDatabaseEnabled } from "@/lib/db/config";
import { createJobEscrowOrder, setJobEscrowToken } from "@/lib/db-escrow";
import { initializeJobEscrowCheckout } from "@/lib/iyzico/client";
import { getIyzicoCallbackUrl, getIyzicoConfig } from "@/lib/iyzico/config";

type Props = { params: Promise<{ id: string }> };

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  return "127.0.0.1";
}

export async function POST(request: Request, { params }: Props) {
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
    const { id: quoteId } = await params;
    const body = await request.json();
    const offerId = body.offerId as string;
    if (!offerId) {
      return NextResponse.json({ error: "Teklif seçin." }, { status: 400 });
    }

    const quote = await getQuoteRequestById(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    const { order, error } = await createJobEscrowOrder({
      customerPhone: phone,
      quoteId,
      offerId,
    });
    if (error || !order) {
      return NextResponse.json({ error: error ?? "Sipariş oluşturulamadı." }, { status: 400 });
    }

    if (order.status === "completed") {
      return NextResponse.json({ error: "Bu talep için ödeme zaten yapıldı." }, { status: 400 });
    }

    const checkout = await initializeJobEscrowCheckout({
      conversationId: order.conversationId,
      basketId: order.basketId,
      jobAmount: order.jobAmount,
      serviceFee: order.serviceFee,
      totalAmount: order.totalAmount,
      serviceName: quote.serviceName,
      callbackUrl: getIyzicoCallbackUrl(),
      buyer: {
        id: quoteId,
        name: quote.name,
        email: quote.email || "musteri@cokusta.com",
        phone,
        city: quote.city,
        ip: clientIp(request),
      },
    });

    await setJobEscrowToken(order.id, checkout.token);

    return NextResponse.json({
      orderId: order.id,
      token: checkout.token,
      checkoutFormContent: checkout.checkoutFormContent,
      totalAmount: order.totalAmount,
      jobAmount: order.jobAmount,
      serviceFee: order.serviceFee,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ödeme başlatılamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
