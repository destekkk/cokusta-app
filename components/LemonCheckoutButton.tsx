"use client";

import { useEffect } from "react";
import { loadLemonSqueezyScript, openLemonCheckout } from "@/lib/lemonsqueezy/lemon-script";

type Props = {
  /** Lemon checkout URL (API veya mağaza buy linki) */
  checkoutUrl: string;
  label: string;
  className?: string;
  disabled?: boolean;
  onClose?: () => void;
};

/**
 * Lemon Squeezy resmi overlay butonu.
 * href + lemonsqueezy-button yerine programatik openLemonCheckout kullanır.
 */
export default function LemonCheckoutButton({
  checkoutUrl,
  label,
  className = "inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60",
  disabled = false,
  onClose,
}: Props) {
  useEffect(() => {
    void loadLemonSqueezyScript();
  }, []);

  return (
    <button
      type="button"
      disabled={disabled || !checkoutUrl}
      className={className}
      onClick={() => void openLemonCheckout(checkoutUrl, { onClose })}
    >
      {label}
    </button>
  );
}
