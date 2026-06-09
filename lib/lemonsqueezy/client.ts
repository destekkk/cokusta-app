import { resolveSiteUrl } from "@/lib/seo/site-url";
import {
  getLemonApiKey,
  getLemonStoreId,
  getLemonVariantId,
  isLemonTestMode,
} from "@/lib/lemonsqueezy/config";
import { getCheckoutProductOptions } from "@/lib/lemonsqueezy/product-media";
import { buildProviderCreditCheckoutCustom } from "@/lib/lemonsqueezy/checkout-custom";
import type { CreditPurchaseOrder } from "@/lib/types";

const API_BASE = "https://api.lemonsqueezy.com/v1";

type LemonCheckoutResult = {
  checkoutId: string;
  checkoutUrl: string;
};

type LemonApiCheckoutResponse = {
  data?: {
    id?: string;
    attributes?: { url?: string };
  };
  errors?: Array<{ detail?: string; title?: string }>;
};

export async function createProviderCreditCheckout(
  order: CreditPurchaseOrder,
  providerEmail?: string | null,
): Promise<{ checkout?: LemonCheckoutResult; error?: string }> {
  const apiKey = getLemonApiKey();
  const storeId = getLemonStoreId();
  if (!apiKey || !storeId) {
    return { error: "Lemon Squeezy yapılandırması eksik." };
  }

  const variantId = getLemonVariantId(order.packageSlug);
  if (!variantId) {
    return {
      error: `Bu paket için Lemon variant tanımlı değil: ${order.packageSlug}`,
    };
  }

  const site = resolveSiteUrl();
  const productOptions = getCheckoutProductOptions(order.packageSlug);
  const successUrl = new URL("/usta/kontor/sonuc", site);
  successUrl.searchParams.set("status", "success");
  successUrl.searchParams.set("order", order.id);
  if (order.credits > 0) {
    successUrl.searchParams.set("credits", String(order.credits));
  }

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        custom_price: order.amount * 100,
        checkout_options: {
          embed: true,
          media: true,
          logo: true,
        },
        checkout_data: {
          email: providerEmail ?? undefined,
          custom: buildProviderCreditCheckoutCustom(order, order.providerId),
        },
        product_options: {
          name: productOptions.name,
          description: productOptions.description,
          media: productOptions.media,
          redirect_url: successUrl.toString(),
          receipt_button_text: "Usta paneline dön",
          receipt_link_url: `${site}/usta/teklifler`,
          receipt_thank_you_note: productOptions.receipt_thank_you_note,
          enabled_variants: [Number(variantId)],
        },
        ...(isLemonTestMode() ? { test_mode: true } : {}),
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  };

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as LemonApiCheckoutResponse;
  if (!res.ok) {
    const detail =
      json.errors?.map((e) => e.detail ?? e.title).filter(Boolean).join(" · ") ||
      "Checkout oluşturulamadı.";
    return { error: detail };
  }

  const checkoutId = json.data?.id;
  const checkoutUrl = json.data?.attributes?.url;
  if (!checkoutId || !checkoutUrl) {
    return { error: "Lemon Squeezy yanıtı geçersiz." };
  }

  return { checkout: { checkoutId, checkoutUrl } };
}
