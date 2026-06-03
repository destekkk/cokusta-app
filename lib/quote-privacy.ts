import type { ProviderOffer, QuoteRequest } from "@/lib/types";

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length < 4) return "••••";
  const last4 = digits.slice(-4);
  return `••• ••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
}

export type PublicQuoteRequest = Omit<QuoteRequest, "phone" | "email"> & {
  phone?: string;
  email?: string;
  offerCount?: number;
};

/** Usta / herkese açık liste — müşteri iletişim bilgisi yok */
export function sanitizeQuoteForProvider(
  quote: QuoteRequest,
  options?: { offerCount?: number }
): PublicQuoteRequest {
  const { phone, email, ...rest } = quote;
  return {
    ...rest,
    offerCount: options?.offerCount,
  };
}

/** Müşteri teklif listesi — usta telefonu yok */
export function sanitizeOfferForCustomer(offer: ProviderOffer) {
  const { providerId, ...rest } = offer;
  return rest;
}

/** Admin — kabul öncesi maskeleme (opsiyonel görünüm) */
export function quotePhoneForAdmin(quote: QuoteRequest, reveal = false): string {
  if (reveal || quote.status === "accepted" || quote.status === "completed") {
    return quote.phone;
  }
  return maskPhone(quote.phone);
}
