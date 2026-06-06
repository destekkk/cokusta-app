import { createCreditPurchaseOrder, getProviderById, setCreditPurchaseToken } from "@/lib/db";
import { createProviderCreditCheckout } from "@/lib/lemonsqueezy/client";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy/config";
import { resolveSiteUrl } from "@/lib/seo/site-url";

export type ProviderCheckoutResult = {
  orderId: string;
  packageName: string;
  amount: number;
  mode: "lemon" | "manual";
  checkoutUrl: string;
};

export async function startProviderCreditCheckout(
  providerId: string,
  packageSlug: string,
  options?: { accessToken?: string },
): Promise<{ result?: ProviderCheckoutResult; error?: string }> {
  const created = await createCreditPurchaseOrder(providerId, packageSlug);
  if (created.error || !created.order) {
    return { error: created.error ?? "Sipariş oluşturulamadı." };
  }

  const order = created.order;
  const base = resolveSiteUrl();

  if (!isLemonSqueezyConfigured()) {
    const auth = options?.accessToken?.trim();
    const manualUrl = auth
      ? `${base}/usta/kontor/mobil?access=${encodeURIComponent(auth)}&order=${encodeURIComponent(order.id)}`
      : `${base}/usta/kontor/mobil?order=${encodeURIComponent(order.id)}`;
    return {
      result: {
        orderId: order.id,
        packageName: order.packageName,
        amount: order.amount,
        mode: "manual",
        checkoutUrl: manualUrl,
      },
    };
  }

  const provider = await getProviderById(providerId);
  const lemon = await createProviderCreditCheckout(order, provider?.email);
  if (lemon.error || !lemon.checkout) {
    return { error: lemon.error ?? "Ödeme sayfası oluşturulamadı." };
  }

  await setCreditPurchaseToken(order.id, lemon.checkout.checkoutId);

  return {
    result: {
      orderId: order.id,
      packageName: order.packageName,
      amount: order.amount,
      mode: "lemon",
      checkoutUrl: lemon.checkout.checkoutUrl,
    },
  };
}
