import { NextResponse } from "next/server";
import { createProviderRegistration } from "@/lib/db";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import {
  hashProviderPin,
  isValidProviderPhone,
  normalizeProviderPhone,
  validateProviderPin,
} from "@/lib/provider-pin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, city, categorySlugs, experience, bio, pin, pinConfirm, companyName } =
      body;

    if (!name || !phone || !city || !categorySlugs?.length) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    if (!isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
    }

    const pinCheck = validateProviderPin(String(pin ?? ""));
    if (!pinCheck.ok) {
      return NextResponse.json({ error: pinCheck.error }, { status: 400 });
    }

    if (String(pin) !== String(pinConfirm ?? "")) {
      return NextResponse.json({ error: "Giriş şifreleri eşleşmiyor." }, { status: 400 });
    }

    const provider = await createProviderRegistration({
      name,
      companyName: typeof companyName === "string" ? companyName.trim() : undefined,
      phone: normalizeProviderPhone(String(phone)),
      email: email ?? "",
      city,
      categorySlugs,
      experience: experience ?? "",
      bio: bio ?? "",
      pinHash: hashProviderPin(String(pin)),
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
