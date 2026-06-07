import { NextResponse } from "next/server";
import {
  fulfillCreditPurchaseOrder,
  failCreditPurchaseOrder,
  getCreditPurchaseOrderByConversationId,
  getProviderById,
} from "@/lib/db";
import { isLemonTestMode } from "@/lib/lemonsqueezy/config";
import {
  getWebhookCustomData,
  parseLemonWebhookPayload,
  verifyLemonWebhookSignature,
} from "@/lib/lemonsqueezy/webhook";
import {
  recordLemonWebhookLog,
  verifyCreditPurchaseFulfillment,
} from "@/lib/lemonsqueezy/webhook-audit";

export const runtime = "nodejs";

const PAID_ORDER_EVENTS = new Set(["order_created"]);
const PAID_SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_payment_success",
]);

function isPayloadTestMode(
  payload: NonNullable<ReturnType<typeof parseLemonWebhookPayload>>,
): boolean {
  const attr = payload.data?.attributes as { test_mode?: boolean } | undefined;
  return attr?.test_mode === true || isLemonTestMode();
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    await recordLemonWebhookLog({
      eventName: "unknown",
      outcome: "signature_invalid",
      errorMessage: "Webhook imzası doğrulanamadı.",
    });
    return NextResponse.json({ error: "Geçersiz imza." }, { status: 401 });
  }

  const payload = parseLemonWebhookPayload(rawBody);
  if (!payload) {
    await recordLemonWebhookLog({
      eventName: "unknown",
      outcome: "invalid_payload",
      errorMessage: "JSON parse hatası.",
    });
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  const custom = getWebhookCustomData(payload);
  const orderType = custom.order_type ?? "provider_credit";
  const conversationId = custom.conversation_id;
  const lemonOrderId = payload.data?.id ?? custom.order_id;
  const testMode = isPayloadTestMode(payload);

  if (orderType !== "provider_credit" || !conversationId) {
    const logId = await recordLemonWebhookLog({
      eventName,
      outcome: "skipped",
      conversationId: conversationId ?? null,
      lemonOrderId: lemonOrderId ?? null,
      testMode,
      responseSummary: { orderType, reason: "provider_credit veya conversation_id yok" },
    });
    return NextResponse.json({ ok: true, skipped: true, audit: { logId } });
  }

  const paymentStatus = payload.data?.attributes?.status?.toLowerCase();

  if (PAID_ORDER_EVENTS.has(eventName)) {
    if (paymentStatus && paymentStatus !== "paid") {
      const logId = await recordLemonWebhookLog({
        eventName,
        outcome: "ignored",
        conversationId,
        lemonOrderId: lemonOrderId ?? null,
        testMode,
        errorMessage: `Ödeme durumu: ${paymentStatus}`,
      });
      return NextResponse.json({ ok: true, ignored: paymentStatus, audit: { logId } });
    }

    const existing = await getCreditPurchaseOrderByConversationId(conversationId);
    if (!existing) {
      const logId = await recordLemonWebhookLog({
        eventName,
        outcome: "order_not_found",
        conversationId,
        lemonOrderId: lemonOrderId ?? null,
        testMode,
        errorMessage: "conversation_id ile sipariş bulunamadı.",
      });
      return NextResponse.json({ error: "Sipariş bulunamadı.", audit: { logId } }, { status: 404 });
    }

    const provider = await getProviderById(existing.providerId);
    const providerCreditBefore = provider?.creditBalance ?? 0;

    const result = await fulfillCreditPurchaseOrder(conversationId, lemonOrderId);

    if (result.error) {
      const logId = await recordLemonWebhookLog({
        eventName,
        outcome: "fulfill_failed",
        conversationId,
        orderId: existing.id,
        lemonOrderId: lemonOrderId ?? null,
        providerId: existing.providerId,
        testMode,
        orderStatusBefore: existing.status,
        errorMessage: result.error,
      });
      return NextResponse.json(
        { error: result.error, audit: { logId, dbVerified: false } },
        { status: 500 },
      );
    }

    const verification = await verifyCreditPurchaseFulfillment(conversationId, {
      providerId: existing.providerId,
      providerCreditBefore,
      expectedCredits: result.credits ?? existing.credits,
    });

    const outcome = result.alreadyCompleted ? "fulfilled_already" : "fulfilled";
    const logId = await recordLemonWebhookLog({
      eventName,
      outcome,
      conversationId,
      orderId: existing.id,
      lemonOrderId: lemonOrderId ?? null,
      providerId: existing.providerId,
      testMode,
      orderStatusBefore: existing.status,
      orderStatusAfter: verification.orderStatus ?? "completed",
      creditsGranted: result.credits ?? existing.credits,
      providerCreditBefore,
      providerCreditAfter: verification.providerCreditAfter,
      dbVerified: verification.dbVerified,
      responseSummary: {
        alreadyCompleted: result.alreadyCompleted ?? false,
        purchaseId: verification.purchaseId,
      },
    });

    return NextResponse.json({
      ok: true,
      fulfilled: true,
      alreadyCompleted: result.alreadyCompleted ?? false,
      audit: {
        logId,
        testMode,
        dbVerified: verification.dbVerified,
        orderId: existing.id,
        conversationId,
        orderStatusAfter: verification.orderStatus,
        creditsGranted: result.credits ?? existing.credits,
        providerCreditBefore,
        providerCreditAfter: verification.providerCreditAfter,
        purchaseId: verification.purchaseId,
      },
    });
  }

  if (PAID_SUBSCRIPTION_EVENTS.has(eventName)) {
    const existing = await getCreditPurchaseOrderByConversationId(conversationId);
    const providerCreditBefore = existing
      ? (await getProviderById(existing.providerId))?.creditBalance ?? 0
      : undefined;

    const result = await fulfillCreditPurchaseOrder(conversationId, lemonOrderId);
    const verification = await verifyCreditPurchaseFulfillment(conversationId, {
      providerId: existing?.providerId,
      providerCreditBefore,
      expectedCredits: result.credits ?? existing?.credits,
    });

    const logId = await recordLemonWebhookLog({
      eventName,
      outcome: result.error ? "fulfill_failed" : "fulfilled",
      conversationId,
      orderId: existing?.id ?? null,
      lemonOrderId: lemonOrderId ?? null,
      providerId: existing?.providerId ?? null,
      testMode,
      orderStatusBefore: existing?.status ?? null,
      orderStatusAfter: verification.orderStatus ?? null,
      creditsGranted: result.credits ?? existing?.credits ?? null,
      providerCreditBefore: providerCreditBefore ?? null,
      providerCreditAfter: verification.providerCreditAfter ?? null,
      dbVerified: verification.dbVerified,
      errorMessage: result.error ?? null,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, audit: { logId, dbVerified: false } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      fulfilled: true,
      audit: { logId, dbVerified: verification.dbVerified },
    });
  }

  if (eventName === "order_refunded") {
    await failCreditPurchaseOrder(conversationId);
    const logId = await recordLemonWebhookLog({
      eventName,
      outcome: "failed",
      conversationId,
      lemonOrderId: lemonOrderId ?? null,
      testMode,
      responseSummary: { action: "order_refunded" },
    });
    return NextResponse.json({ ok: true, failed: true, audit: { logId } });
  }

  const logId = await recordLemonWebhookLog({
    eventName,
    outcome: "unhandled",
    conversationId,
    lemonOrderId: lemonOrderId ?? null,
    testMode,
  });

  return NextResponse.json({ ok: true, event: eventName, audit: { logId } });
}
