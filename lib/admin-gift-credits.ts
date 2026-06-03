export const ADMIN_GIFT_CREDIT_AMOUNTS = [10, 30, 50, 100] as const;

export type AdminGiftCreditAmount = (typeof ADMIN_GIFT_CREDIT_AMOUNTS)[number];

export function isValidAdminGiftCreditAmount(value: number): value is AdminGiftCreditAmount {
  return (ADMIN_GIFT_CREDIT_AMOUNTS as readonly number[]).includes(value);
}
