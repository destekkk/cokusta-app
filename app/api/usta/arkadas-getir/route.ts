import { NextResponse } from "next/server";
import { getProviderReferrals, submitProviderReferral } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getCategoryName } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { maskReferralPhone, REFERRAL_CAMPAIGN } from "@/lib/referrals";

function serviceLabels(slugs: string[]): string {
  return slugs
    .map((slug) => services.find((s) => s.slug === slug)?.name ?? slug)
    .join(", ");
}

function mapReferral(r: Awaited<ReturnType<typeof getProviderReferrals>>[number]) {
  return {
    id: r.id,
    name: r.referredName,
    phoneMasked: maskReferralPhone(r.referredPhone),
    categoryName: r.categorySlug ? getCategoryName(r.categorySlug) : "",
    serviceNames: serviceLabels(r.serviceSlugs ?? []),
    creditsAwarded: r.creditsAwarded,
    registered: Boolean(r.referredProviderId),
    createdAt: r.createdAt,
  };
}

export async function GET() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const referrals = await getProviderReferrals(providerId);
  const totalCreditsEarned = referrals.reduce((sum, r) => sum + r.creditsAwarded, 0);

  return NextResponse.json({
    campaign: REFERRAL_CAMPAIGN,
    referrals: referrals.map(mapReferral),
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
    const body = await request.json();
    const phone = body.phone;
    const name = body.name;
    const categorySlug = body.categorySlug;
    const serviceSlugs = Array.isArray(body.serviceSlugs) ? body.serviceSlugs : [];

    if (!phone) {
      return NextResponse.json({ error: "Telefon numarası girin." }, { status: 400 });
    }

    const result = await submitProviderReferral(providerId, {
      phone: String(phone),
      name: String(name ?? ""),
      categorySlug: String(categorySlug ?? ""),
      serviceSlugs: serviceSlugs.map(String),
    });
    if (result.error) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      creditsAwarded: result.creditsAwarded,
      creditBalance: result.creditBalance,
      referral: result.referral ? mapReferral(result.referral) : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Davet kaydedilemedi." }, { status: 500 });
  }
}
