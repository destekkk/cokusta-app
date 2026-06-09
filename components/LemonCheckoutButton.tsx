"use client";

import { useEffect, useState } from "react";
import { loadLemonSqueezyScript } from "@/lib/lemonsqueezy/lemon-script";
import { startLemonProviderCheckout } from "@/lib/lemonsqueezy/start-checkout";

type Props = {
  /** Hazır checkout URL (API'den alınmış) */
  checkoutUrl?: string;
  /** Paket slug — checkoutUrl yoksa API ile oluşturulur (örn. kontor-5 → variant 1758264) */
  packageSlug?: string;
  /** Usta oturum ID — checkout_data.custom.user_id olarak Lemon'a gider */
  userId?: string;
  label: string;
  className?: string;
  disabled?: boolean;
  onClose?: () => void;
};

/**
 * Lemon overlay ödeme butonu.
 * packageSlug + userId ile tıklanınca checkout_data içinde userId Lemon'a iletilir.
 */
export default function LemonCheckoutButton({
  checkoutUrl,
  packageSlug,
  userId,
  label,
  className = "inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60",
  disabled = false,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadLemonSqueezyScript();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (packageSlug) {
        await startLemonProviderCheckout({ packageSlug, userId });
      } else if (checkoutUrl) {
        const { openLemonCheckout } = await import("@/lib/lemonsqueezy/lemon-script");
        await openLemonCheckout(checkoutUrl, { onClose });
      }
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  const canPay = Boolean(packageSlug || checkoutUrl);

  return (
    <button
      type="button"
      disabled={disabled || loading || !canPay}
      className={className}
      onClick={() => void handleClick()}
    >
      {loading ? "Hazırlanıyor…" : label}
    </button>
  );
}
