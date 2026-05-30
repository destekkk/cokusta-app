import { NextResponse } from "next/server";
import { createProviderRegistration } from "@/lib/db";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, city, categorySlugs, experience, bio } = body;

    if (!name || !phone || !city || !categorySlugs?.length) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    const provider = await createProviderRegistration({
      name,
      phone,
      email: email ?? "",
      city,
      categorySlugs,
      experience: experience ?? "",
      bio: bio ?? "",
    });

    return NextResponse.json({
      success: true,
      id: provider.id,
      launchMemberNumber: provider.launchMemberNumber,
      launchCredits: provider.launchMemberNumber
        ? LAUNCH_CAMPAIGN.provider.freeCredits
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Kayıt oluşturulamadı." },
      { status: 500 }
    );
  }
}
