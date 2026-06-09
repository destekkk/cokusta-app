import type { CreditPurchaseOrder } from "@/lib/types";

/** Lemon checkout_data.custom — webhook'ta meta.custom_data olarak gelir */
export function buildProviderCreditCheckoutCustom(
  order: CreditPurchaseOrder,
  userId: string,
): Record<string, string> {
  return {
    order_type: "provider_credit",
    order_id: order.id,
    conversation_id: order.conversationId,
    provider_id: order.providerId,
    user_id: userId,
    userId,
    package_slug: order.packageSlug,
  };
}
