/** 10.000 ₺'ye kadar hizmet bedeli oranı */
export const PARAM_GUVENDE_FEE_RATE_STANDARD = 0.1;
/** 10.000 ₺ üzeri kısım için hizmet bedeli oranı */
export const PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD = 0.08;
export const PARAM_GUVENDE_FEE_THRESHOLD = 10_000;

export type ParamGuvendeFeeTier = {
  label: string;
  baseAmount: number;
  rate: number;
  fee: number;
};

export type ParamGuvendeBreakdown = {
  jobAmount: number;
  serviceFee: number;
  totalAmount: number;
  tiers: ParamGuvendeFeeTier[];
};

export function computeParamGuvendeBreakdown(jobAmount: number): ParamGuvendeBreakdown {
  const tiers: ParamGuvendeFeeTier[] = [];

  if (jobAmount <= PARAM_GUVENDE_FEE_THRESHOLD) {
    const fee = Math.round(jobAmount * PARAM_GUVENDE_FEE_RATE_STANDARD);
    tiers.push({
      label: `%${PARAM_GUVENDE_FEE_RATE_STANDARD * 100} (10.000 ₺'ye kadar)`,
      baseAmount: jobAmount,
      rate: PARAM_GUVENDE_FEE_RATE_STANDARD,
      fee,
    });
    return { jobAmount, serviceFee: fee, totalAmount: jobAmount + fee, tiers };
  }

  const tier1Base = PARAM_GUVENDE_FEE_THRESHOLD;
  const tier1Fee = Math.round(tier1Base * PARAM_GUVENDE_FEE_RATE_STANDARD);
  tiers.push({
    label: `%${PARAM_GUVENDE_FEE_RATE_STANDARD * 100} (ilk 10.000 ₺)`,
    baseAmount: tier1Base,
    rate: PARAM_GUVENDE_FEE_RATE_STANDARD,
    fee: tier1Fee,
  });

  const tier2Base = jobAmount - PARAM_GUVENDE_FEE_THRESHOLD;
  const tier2Fee = Math.round(tier2Base * PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD);
  tiers.push({
    label: `%${PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD * 100} (10.000 ₺ üzeri)`,
    baseAmount: tier2Base,
    rate: PARAM_GUVENDE_FEE_RATE_ABOVE_THRESHOLD,
    fee: tier2Fee,
  });

  const serviceFee = tier1Fee + tier2Fee;
  return { jobAmount, serviceFee, totalAmount: jobAmount + serviceFee, tiers };
}

export function formatParamGuvendeFeeSummary(breakdown: ParamGuvendeBreakdown): string {
  if (breakdown.tiers.length === 1) {
    return `%${breakdown.tiers[0].rate * 100} hizmet bedeli`;
  }
  return `%10 (10.000 ₺'ye kadar) + %8 (üzeri)`;
}
