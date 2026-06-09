"use client";

import { loadLemonSqueezyScript, openLemonCheckout } from "@/lib/lemonsqueezy/lemon-script";

/** 5 Kontör — Lemon variant ID (LEMONSQUEEZY_VARIANT_KONTOR_5) */
export const LEMON_VARIANT_KONTOR_5 = "1758264";

export type StartLemonCheckoutOptions = {
  packageSlug: string;
  /** Oturumdaki usta ID — API sunucuda doğrular; checkout_data.custom.user_id olarak gider */
  userId?: string;
  accessToken?: string;
};

/**
 * Ödeme butonu: API checkout oluşturur (userId checkout_data içinde),
 * ardından Lemon overlay açar.
 */
export async function startLemonProviderCheckout(
  options: StartLemonCheckoutOptions,
): Promise<string> {
  const { packageSlug, userId, accessToken } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken?.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  }

  const res = await fetch("/api/payments/create-checkout", {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({
      packageSlug,
      orderType: "provider_credit",
      ...(userId ? { userId } : {}),
    }),
  });

  const data = (await res.json()) as {
    error?: string;
    checkoutUrl?: string;
    url?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Ödeme başlatılamadı");
  }

  const checkoutUrl = data.checkoutUrl ?? data.url ?? "";
  if (!checkoutUrl) {
    throw new Error("Ödeme adresi alınamadı.");
  }

  await loadLemonSqueezyScript();
  await openLemonCheckout(checkoutUrl);
  return checkoutUrl;
}
