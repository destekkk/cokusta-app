import { NextResponse } from "next/server";
import { createCreditPurchaseOrder } from "@/lib/db";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";
import { resolveSiteUrl } from "@/lib/seo/site-url";

export async function POST(request: Request) {
  const providerId = await getProviderSessionIdFromRequest(request);
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let packageSlug: string;
  try {
    const body = await request.json();
    packageSlug = String(body.packageSlug ?? "");
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!packageSlug) {
    return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
  }

  const result = await createCreditPurchaseOrder(providerId, packageSlug);
  if (result.error || !result.order) {
    return NextResponse.json({ error: result.error ?? "Sipariş oluşturulamadı." }, { status: 400 });
  }

  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const base = resolveSiteUrl();
  const paymentUrl = auth
    ? `${base}/usta/kontor/mobil?access=${encodeURIComponent(auth)}&order=${encodeURIComponent(result.order.id)}`
    : `${base}/usta/kontor/mobil?order=${encodeURIComponent(result.order.id)}`;

  return NextResponse.json({
    orderId: result.order.id,
    paymentUrl,
    amount: result.order.amount,
    packageName: result.order.packageName,
  });
}
