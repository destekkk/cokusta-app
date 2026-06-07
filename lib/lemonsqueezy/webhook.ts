import { createHmac, timingSafeEqual } from "crypto";
import { getLemonWebhookSecret } from "@/lib/lemonsqueezy/config";

export function verifyLemonWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = getLemonWebhookSecret();
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.trim();

  if (expected.length !== received.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

export type LemonWebhookMeta = {
  event_name?: string;
  custom_data?: Record<string, string | number | boolean | null>;
};

export type LemonWebhookPayload = {
  meta?: LemonWebhookMeta;
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      identifier?: string;
      order_number?: number;
      test_mode?: boolean;
    };
  };
};

export function parseLemonWebhookPayload(rawBody: string): LemonWebhookPayload | null {
  try {
    return JSON.parse(rawBody) as LemonWebhookPayload;
  } catch {
    return null;
  }
}

export function getWebhookCustomData(
  payload: LemonWebhookPayload,
): Record<string, string> {
  const custom = payload.meta?.custom_data ?? {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(custom)) {
    if (v != null) out[k] = String(v);
  }
  return out;
}
