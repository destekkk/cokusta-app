import type { CustomerJobEscrowOrder } from "@/lib/types";
import { computeParamGuvendeBreakdown } from "@/lib/param-guvende";
import { getCurrentOfferPrice } from "@/lib/offer-utils";
import { generateId } from "@/lib/id";
import { normalizeProviderPhone, phonesEqual } from "@/lib/phone-utils";
import { prisma } from "@/lib/prisma";
import { appendCreditLedger } from "@/lib/db-credits";
import { createProviderInboxMessage } from "@/lib/db-inbox";
import type { ProviderOffer } from "@/lib/types";

function toEscrowOrder(row: {
  id: string;
  quoteRequestId: string;
  offerId: string;
  customerPhone: string;
  providerId: string;
  jobAmount: number;
  serviceFee: number;
  totalAmount: number;
  conversationId: string;
  basketId: string;
  status: string;
  releaseStatus: string;
  iyzicoToken: string | null;
  iyzicoPaymentId: string | null;
  createdAt: Date;
  completedAt: Date | null;
  releaseRequestedAt: Date | null;
  releasedAt: Date | null;
}): CustomerJobEscrowOrder {
  return {
    id: row.id,
    quoteRequestId: row.quoteRequestId,
    offerId: row.offerId,
    customerPhone: row.customerPhone,
    providerId: row.providerId,
    jobAmount: row.jobAmount,
    serviceFee: row.serviceFee,
    totalAmount: row.totalAmount,
    conversationId: row.conversationId,
    basketId: row.basketId,
    status: row.status as CustomerJobEscrowOrder["status"],
    releaseStatus: row.releaseStatus as CustomerJobEscrowOrder["releaseStatus"],
    iyzicoToken: row.iyzicoToken ?? undefined,
    iyzicoPaymentId: row.iyzicoPaymentId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    releaseRequestedAt: row.releaseRequestedAt?.toISOString(),
    releasedAt: row.releasedAt?.toISOString(),
  };
}

function mapOfferPrice(offerRow: {
  price: number;
  negotiation: unknown;
}): number {
  const negotiation = Array.isArray(offerRow.negotiation)
    ? (offerRow.negotiation as ProviderOffer["negotiation"])
    : [];
  return getCurrentOfferPrice({
    price: offerRow.price,
    negotiation,
  } as ProviderOffer);
}

export async function getJobEscrowOrderForQuote(quoteId: string) {
  const row = await prisma.customerJobEscrowOrder.findUnique({
    where: { quoteRequestId: quoteId },
  });
  return row ? toEscrowOrder(row) : undefined;
}

export async function getJobEscrowOrderByConversationId(conversationId: string) {
  const row = await prisma.customerJobEscrowOrder.findUnique({
    where: { conversationId },
  });
  return row ? toEscrowOrder(row) : undefined;
}

export async function createJobEscrowOrder(input: {
  customerPhone: string;
  quoteId: string;
  offerId: string;
}): Promise<{ order?: CustomerJobEscrowOrder; error?: string }> {
  const phone = normalizeProviderPhone(input.customerPhone);
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: input.quoteId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  if (!phonesEqual(quoteRow.phone, phone)) return { error: "Bu talep size ait değil." };

  const offerRow = await prisma.providerOffer.findUnique({ where: { id: input.offerId } });
  if (!offerRow || offerRow.quoteRequestId !== input.quoteId) {
    return { error: "Teklif bulunamadı." };
  }
  if (!offerRow.customerAgreedAt) {
    return { error: "Ödeme için önce Anlaştık demelisiniz." };
  }
  if (offerRow.status === "rejected" || offerRow.status === "withdrawn") {
    return { error: "Bu teklif artık geçerli değil." };
  }

  const existing = await prisma.customerJobEscrowOrder.findUnique({
    where: { quoteRequestId: input.quoteId },
  });
  if (existing?.status === "completed") {
    return { order: toEscrowOrder(existing) };
  }
  if (existing?.status === "pending") {
    return { order: toEscrowOrder(existing) };
  }

  const jobAmount = mapOfferPrice(offerRow);
  const { serviceFee, totalAmount } = computeParamGuvendeBreakdown(jobAmount);
  const id = generateId();

  const row = await prisma.customerJobEscrowOrder.create({
    data: {
      id,
      quoteRequestId: input.quoteId,
      offerId: input.offerId,
      customerPhone: phone,
      providerId: offerRow.providerId,
      jobAmount,
      serviceFee,
      totalAmount,
      conversationId: `cust-escrow-${id}`,
      basketId: id,
      createdAt: new Date(),
    },
  });

  return { order: toEscrowOrder(row) };
}

export async function setJobEscrowToken(orderId: string, token: string) {
  const row = await prisma.customerJobEscrowOrder.update({
    where: { id: orderId },
    data: { iyzicoToken: token },
  });
  return toEscrowOrder(row);
}

async function notifyProviderEscrowHeld(order: {
  id: string;
  providerId: string;
  quoteRequestId: string;
  jobAmount: number;
  totalAmount: number;
}) {
  await createProviderInboxMessage({
    providerId: order.providerId,
    type: "escrow_held",
    title: "Param Güvende — ödeme havuzda",
    body: `Müşteri ${order.jobAmount.toLocaleString("tr-TR")} ₺ iş bedelini Param Güvende ile ödedi. Tutar güvenli havuzda bekliyor. İş tamamlandığında müşteri onayıyla hesabınıza aktarılacaktır.`,
    quoteRequestId: order.quoteRequestId,
  });
}

export async function fulfillJobEscrowOrder(
  conversationId: string,
  iyzicoPaymentId?: string
): Promise<{ order?: CustomerJobEscrowOrder; error?: string; alreadyCompleted?: boolean }> {
  const row = await prisma.customerJobEscrowOrder.findUnique({ where: { conversationId } });
  if (!row) return { error: "Sipariş bulunamadı." };
  if (row.status === "completed") {
    return { order: toEscrowOrder(row), alreadyCompleted: true };
  }
  if (row.status === "failed") return { error: "Sipariş başarısız." };

  const completedAt = new Date();
  const feeRate =
    row.jobAmount > 10_000
      ? row.serviceFee / row.jobAmount
      : 0.1;

  await prisma.$transaction(async (tx) => {
    await tx.customerJobEscrowOrder.update({
      where: { id: row.id },
      data: {
        status: "completed",
        iyzicoPaymentId: iyzicoPaymentId ?? null,
        completedAt,
      },
    });
    await tx.quoteRequest.update({
      where: { id: row.quoteRequestId },
      data: {
        escrowPaidAmount: row.totalAmount,
        escrowServiceFee: row.serviceFee,
        jobValue: row.jobAmount,
        commissionRate: feeRate,
        commissionAmount: row.serviceFee,
        customerPaymentAt: completedAt,
      },
    });
    await appendCreditLedger(tx, {
      type: "customer_escrow_payment",
      creditsDelta: 0,
      tlAmount: row.totalAmount,
      providerId: row.providerId,
      quoteRequestId: row.quoteRequestId,
      referenceId: row.id,
      description: `Param Güvende ödeme: ${row.jobAmount} ₺ iş + ${row.serviceFee} ₺ hizmet bedeli (havuzda)`,
      createdAt: completedAt,
    });
  });

  await notifyProviderEscrowHeld(row);

  const updated = await prisma.customerJobEscrowOrder.findUniqueOrThrow({ where: { id: row.id } });
  return { order: toEscrowOrder(updated) };
}

export async function releaseEscrowToProvider(
  quoteId: string,
  customerPhone: string
): Promise<{ order?: CustomerJobEscrowOrder; error?: string }> {
  const phone = normalizeProviderPhone(customerPhone);
  const row = await prisma.customerJobEscrowOrder.findUnique({ where: { quoteRequestId: quoteId } });
  if (!row) return { error: "Ödeme kaydı bulunamadı." };
  if (!phonesEqual(row.customerPhone, phone)) return { error: "Bu talep size ait değil." };
  if (row.status !== "completed") return { error: "Önce Param Güvende ödemesi tamamlanmalı." };
  if (row.releaseStatus === "released") return { order: toEscrowOrder(row) };

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.customerJobEscrowOrder.update({
      where: { id: row.id },
      data: {
        releaseStatus: "released",
        releaseRequestedAt: row.releaseRequestedAt ?? now,
        releasedAt: now,
      },
    });
    await tx.provider.update({
      where: { id: row.providerId },
      data: { escrowBalanceTl: { increment: row.jobAmount } },
    });
    await appendCreditLedger(tx, {
      type: "provider_escrow_release",
      creditsDelta: 0,
      tlAmount: row.jobAmount,
      providerId: row.providerId,
      quoteRequestId: row.quoteRequestId,
      referenceId: row.id,
      description: `Param Güvende ustaya aktarım: ${row.jobAmount} ₺`,
      createdAt: now,
    });
    await tx.quoteRequest.update({
      where: { id: quoteId },
      data: { status: "completed", completedAt: now },
    });
  });

  await createProviderInboxMessage({
    providerId: row.providerId,
    type: "escrow_released",
    title: "Ödeme hesabınıza yüklendi",
    body: `${row.jobAmount.toLocaleString("tr-TR")} ₺ iş bedeli Param Güvende havuzundan hesabınıza aktarıldı. Bakiyenizden nakit çekim talebi oluşturabilirsiniz.`,
    quoteRequestId: quoteId,
  });

  const updated = await prisma.customerJobEscrowOrder.findUniqueOrThrow({ where: { id: row.id } });
  return { order: toEscrowOrder(updated) };
}

export async function failJobEscrowOrder(conversationId: string) {
  const row = await prisma.customerJobEscrowOrder.findUnique({ where: { conversationId } });
  if (!row || row.status === "completed") return null;
  const updated = await prisma.customerJobEscrowOrder.update({
    where: { id: row.id },
    data: { status: "failed" },
  });
  return toEscrowOrder(updated);
}
