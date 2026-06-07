import { isDatabaseEnabled } from "@/lib/db/config";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { isLemonTestMode } from "@/lib/lemonsqueezy/config";

export type LemonWebhookOutcome =
  | "received"
  | "signature_invalid"
  | "invalid_payload"
  | "skipped"
  | "ignored"
  | "order_not_found"
  | "fulfilled"
  | "fulfilled_already"
  | "fulfill_failed"
  | "failed"
  | "unhandled";

export type LemonWebhookLogInput = {
  eventName: string;
  outcome: LemonWebhookOutcome;
  conversationId?: string | null;
  orderId?: string | null;
  lemonOrderId?: string | null;
  providerId?: string | null;
  testMode?: boolean;
  orderStatusBefore?: string | null;
  orderStatusAfter?: string | null;
  creditsGranted?: number | null;
  providerCreditBefore?: number | null;
  providerCreditAfter?: number | null;
  dbVerified?: boolean;
  errorMessage?: string | null;
  responseSummary?: Record<string, unknown> | null;
};

export type LemonWebhookVerification = {
  orderFound: boolean;
  orderStatus?: string;
  orderCompleted: boolean;
  creditsGranted?: number;
  providerId?: string;
  providerCreditBefore?: number;
  providerCreditAfter?: number;
  purchaseId?: string | null;
  dbVerified: boolean;
};

const LOG_PREFIX = "[lemon-webhook]";

function consoleAudit(entry: LemonWebhookLogInput & { logId?: string }) {
  console.info(
    LOG_PREFIX,
    JSON.stringify({
      logId: entry.logId ?? null,
      at: new Date().toISOString(),
      eventName: entry.eventName,
      outcome: entry.outcome,
      testMode: entry.testMode ?? isLemonTestMode(),
      conversationId: entry.conversationId ?? null,
      orderId: entry.orderId ?? null,
      lemonOrderId: entry.lemonOrderId ?? null,
      providerId: entry.providerId ?? null,
      orderStatusBefore: entry.orderStatusBefore ?? null,
      orderStatusAfter: entry.orderStatusAfter ?? null,
      creditsGranted: entry.creditsGranted ?? null,
      providerCreditBefore: entry.providerCreditBefore ?? null,
      providerCreditAfter: entry.providerCreditAfter ?? null,
      dbVerified: entry.dbVerified ?? false,
      errorMessage: entry.errorMessage ?? null,
      responseSummary: entry.responseSummary ?? null,
    }),
  );
}

/** Webhook olayını konsola ve (varsa) veritabanına yazar */
export async function recordLemonWebhookLog(
  input: LemonWebhookLogInput,
): Promise<string | null> {
  const logId = generateId();
  const payload = { ...input, logId };
  consoleAudit(payload);

  if (!isDatabaseEnabled()) return logId;

  try {
    await prisma.lemonWebhookLog.create({
      data: {
        id: logId,
        eventName: input.eventName,
        conversationId: input.conversationId ?? null,
        orderId: input.orderId ?? null,
        lemonOrderId: input.lemonOrderId ?? null,
        providerId: input.providerId ?? null,
        testMode: input.testMode ?? isLemonTestMode(),
        outcome: input.outcome,
        orderStatusBefore: input.orderStatusBefore ?? null,
        orderStatusAfter: input.orderStatusAfter ?? null,
        creditsGranted: input.creditsGranted ?? null,
        providerCreditBefore: input.providerCreditBefore ?? null,
        providerCreditAfter: input.providerCreditAfter ?? null,
        dbVerified: input.dbVerified ?? false,
        errorMessage: input.errorMessage ?? null,
        responseSummary: input.responseSummary
          ? JSON.stringify(input.responseSummary)
          : null,
        createdAt: new Date(),
      },
    });
    return logId;
  } catch (err) {
    console.error(LOG_PREFIX, "DB log yazılamadı:", err);
    return logId;
  }
}

/** Ödeme sonrası sipariş ve usta bakiyesinin DB'de güncellendiğini doğrular */
export async function verifyCreditPurchaseFulfillment(
  conversationId: string,
  options?: {
    providerId?: string;
    providerCreditBefore?: number;
    expectedCredits?: number;
  },
): Promise<LemonWebhookVerification> {
  if (!isDatabaseEnabled()) {
    return { orderFound: false, orderCompleted: false, dbVerified: false };
  }

  const row = await prisma.creditPurchaseOrder.findUnique({
    where: { conversationId },
    include: { provider: { select: { id: true, creditBalance: true } } },
  });

  if (!row) {
    return { orderFound: false, orderCompleted: false, dbVerified: false };
  }

  const providerCreditAfter = row.provider.creditBalance ?? 0;
  const creditBefore = options?.providerCreditBefore;
  const creditsGranted =
    creditBefore != null && row.status === "completed"
      ? providerCreditAfter - creditBefore
      : row.credits;

  const orderCompleted = row.status === "completed";
  const expectedCredits = options?.expectedCredits ?? row.credits;
  const creditIncreased =
    creditBefore == null ||
    expectedCredits <= 0 ||
    providerCreditAfter >= creditBefore + expectedCredits;

  const dbVerified =
    orderCompleted &&
    row.completedAt != null &&
    Boolean(row.purchaseId) &&
    creditIncreased;

  return {
    orderFound: true,
    orderStatus: row.status,
    orderCompleted,
    creditsGranted: row.credits > 0 ? creditsGranted : undefined,
    providerId: row.providerId,
    providerCreditBefore: creditBefore,
    providerCreditAfter,
    purchaseId: row.purchaseId,
    dbVerified,
  };
}

export async function listLemonWebhookLogs(options?: {
  limit?: number;
  conversationId?: string;
}) {
  if (!isDatabaseEnabled()) return [];

  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
  return prisma.lemonWebhookLog.findMany({
    where: options?.conversationId
      ? { conversationId: options.conversationId }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
