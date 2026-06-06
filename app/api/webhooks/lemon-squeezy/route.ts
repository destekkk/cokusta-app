import { NextResponse } from "next/server";
import {
  fulfillCreditPurchaseOrder,
  failCreditPurchaseOrder,
  getCreditPurchaseOrderByConversationId,
} from "@/lib/db";
import {
  getWebhookCustomData,
  parseLemonWebhookPayload,
  verifyLemonWebhookSignature,
} from "@/lib/lemonsqueezy/webhook";

export const runtime = "nodejs";

const PAID_ORDER_EVENTS = new Set(["order_created"]);
const PAID_SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_payment_success",
]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Geçersiz imza." }, { status: 401 });
  }

  const payload = parseLemonWebhookPayload(rawBody);
  if (!payload) {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  const custom = getWebhookCustomData(payload);
  const orderType = custom.order_type ?? "provider_credit";
  const conversationId = custom.conversation_id;
  const lemonOrderId = payload.data?.id ?? custom.order_id;

  if (orderType !== "provider_credit" || !conversationId) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const status = payload.data?.attributes?.status?.toLowerCase();

  if (PAID_ORDER_EVENTS.has(eventName)) {
    if (status && status !== "paid") {
      return NextResponse.json({ ok: true, ignored: status });
    }
    const existing = await getCreditPurchaseOrderByConversationId(conversationId);
    if (!existing) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }
    await fulfillCreditPurchaseOrder(conversationId, lemonOrderId);
    return NextResponse.json({ ok: true, fulfilled: true });
  }

  if (PAID_SUBSCRIPTION_EVENTS.has(eventName)) {
    await fulfillCreditPurchaseOrder(conversationId, lemonOrderId);
    return NextResponse.json({ ok: true, fulfilled: true });
  }

  if (eventName === "order_refunded") {
    await failCreditPurchaseOrder(conversationId);
    return NextResponse.json({ ok: true, failed: true });
  }

  return NextResponse.json({ ok: true, event: eventName });
}
