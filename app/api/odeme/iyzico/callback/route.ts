import { NextResponse } from "next/server";
import { retrieveCheckoutResult } from "@/lib/iyzico/client";
import {
  fulfillCreditPurchaseOrder,
  failCreditPurchaseOrder,
  getCreditPurchaseOrderByConversationId,
} from "@/lib/db";
import {
  fulfillCustomerCreditPurchaseOrder,
  failCustomerCreditPurchaseOrder,
  getCustomerCreditOrderByConversationId,
} from "@/lib/db-credits";
import {
  fulfillJobEscrowOrder,
  failJobEscrowOrder,
  getJobEscrowOrderByConversationId,
} from "@/lib/db-escrow";
import { getSiteUrl } from "@/lib/iyzico/config";

export async function POST(request: Request) {
  const siteUrl = getSiteUrl();

  try {
    const formData = await request.formData();
    const token = formData.get("token")?.toString();

    if (!token) {
      return NextResponse.redirect(new URL("/usta/kontor/sonuc?status=error", siteUrl));
    }

    const result = await retrieveCheckoutResult(token);
    const conversationId = result.conversationId;

    if (!conversationId) {
      return NextResponse.redirect(new URL("/usta/kontor/sonuc?status=error", siteUrl));
    }

    if (conversationId.startsWith("cust-escrow-")) {
      const escrowOrder = await getJobEscrowOrderByConversationId(conversationId);

      if (result.paymentStatus === "SUCCESS") {
        const fulfilled = await fulfillJobEscrowOrder(conversationId, result.paymentId);
        const orderId = fulfilled.order?.id ?? escrowOrder?.id ?? "";
        const quoteId = fulfilled.order?.quoteRequestId ?? escrowOrder?.quoteRequestId ?? "";
        return NextResponse.redirect(
          new URL(
            `/musteri/teklif/odeme-sonuc?status=success&order=${orderId}&quote=${quoteId}`,
            siteUrl
          )
        );
      }

      await failJobEscrowOrder(conversationId);
      const orderId = escrowOrder?.id ?? "";
      const quoteId = escrowOrder?.quoteRequestId ?? "";
      return NextResponse.redirect(
        new URL(
          `/musteri/teklif/odeme-sonuc?status=failed&order=${orderId}&quote=${quoteId}`,
          siteUrl
        )
      );
    }

    if (conversationId.startsWith("cust-credit-")) {
      const custOrder = await getCustomerCreditOrderByConversationId(conversationId);

      if (result.paymentStatus === "SUCCESS") {
        const fulfilled = await fulfillCustomerCreditPurchaseOrder(
          conversationId,
          result.paymentId
        );
        const orderId = fulfilled.order?.id ?? custOrder?.id ?? "";
        const credits = fulfilled.credits ?? custOrder?.credits ?? 0;
        return NextResponse.redirect(
          new URL(
            `/musteri/kontor/sonuc?status=success&order=${orderId}&credits=${credits}`,
            siteUrl
          )
        );
      }

      await failCustomerCreditPurchaseOrder(conversationId);
      const orderId = custOrder?.id ?? "";
      return NextResponse.redirect(
        new URL(`/musteri/kontor/sonuc?status=failed&order=${orderId}`, siteUrl)
      );
    }

    const order = await getCreditPurchaseOrderByConversationId(conversationId);

    if (result.paymentStatus === "SUCCESS") {
      const fulfilled = await fulfillCreditPurchaseOrder(conversationId, result.paymentId);
      const orderId = fulfilled.order?.id ?? order?.id ?? "";
      const credits = fulfilled.credits ?? order?.credits ?? 0;
      return NextResponse.redirect(
        new URL(
          `/usta/kontor/sonuc?status=success&order=${orderId}&credits=${credits}`,
          siteUrl
        )
      );
    }

    await failCreditPurchaseOrder(conversationId);
    const orderId = order?.id ?? "";
    return NextResponse.redirect(
      new URL(`/usta/kontor/sonuc?status=failed&order=${orderId}`, siteUrl)
    );
  } catch {
    return NextResponse.redirect(new URL("/usta/kontor/sonuc?status=error", siteUrl));
  }
}
