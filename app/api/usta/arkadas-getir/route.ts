import { NextResponse } from "next/server";
import { getProviderReferrals, submitProviderReferral } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
import { maskReferralPhone, REFERRAL_CAMPAIGN } from "@/lib/referrals";

export async function GET() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const referrals = await getProviderReferrals(providerId);
  const totalCreditsEarned = referrals.reduce((sum, r) => sum + r.creditsAwarded, 0);

  return NextResponse.json({
    campaign: REFERRAL_CAMPAIGN,
    referrals: referrals.map((r) => ({
      id: r.id,
      phoneMasked: maskReferralPhone(r.referredPhone),
      creditsAwarded: r.creditsAwarded,
      registered: Boolean(r.referredProviderId),
      createdAt: r.createdAt,
    })),
    totalCreditsEarned,
    referralCount: referrals.length,
  });
}

export async function POST(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Telefon numarası girin." }, { status: 400 });
    }

    const result = await submitProviderReferral(providerId, String(phone));
    if (result.error) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      creditsAwarded: result.creditsAwarded,
      creditBalance: result.creditBalance,
      referral: result.referral
        ? {
            id: result.referral.id,
            phoneMasked: maskReferralPhone(result.referral.referredPhone),
            creditsAwarded: result.referral.creditsAwarded,
            createdAt: result.referral.createdAt,
          }
        : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Davet kaydedilemedi." }, { status: 500 });
  }
}
