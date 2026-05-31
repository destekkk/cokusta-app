import { NextResponse } from "next/server";
import { retrieveCheckoutResult } from "@/lib/iyzico/client";
import {
  fulfillCreditPurchaseOrder,
  failCreditPurchaseOrder,
  getCreditPurchaseOrderByConversationId,
} from "@/lib/db";
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

    const order = await getCreditPurchaseOrderByConversationId(conversationId);

    if (result.paymentStatus === "SUCCESS") {
      const fulfilled = await fulfillCreditPurchaseOrder(
        conversationId,
        result.paymentId
      );
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
