import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLemonWebhookLogs } from "@/lib/lemonsqueezy/webhook-audit";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId")?.trim() || undefined;
  const limit = Number(searchParams.get("limit") ?? "20");

  const logs = await listLemonWebhookLogs({ limit, conversationId });

  return NextResponse.json({
    count: logs.length,
    logs: logs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
      eventName: log.eventName,
      outcome: log.outcome,
      testMode: log.testMode,
      conversationId: log.conversationId,
      orderId: log.orderId,
      lemonOrderId: log.lemonOrderId,
      providerId: log.providerId,
      orderStatusBefore: log.orderStatusBefore,
      orderStatusAfter: log.orderStatusAfter,
      creditsGranted: log.creditsGranted,
      providerCreditBefore: log.providerCreditBefore,
      providerCreditAfter: log.providerCreditAfter,
      dbVerified: log.dbVerified,
      errorMessage: log.errorMessage,
      responseSummary: log.responseSummary
        ? (JSON.parse(log.responseSummary) as Record<string, unknown>)
        : null,
    })),
  });
}
