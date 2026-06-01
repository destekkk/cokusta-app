import { NextResponse } from "next/server";
import { updateProvider } from "@/lib/db";
import { requireApprovedProviderApi } from "@/lib/provider-guard";

export async function GET() {
  const auth = await requireApprovedProviderApi();
  if (auth instanceof NextResponse) return auth;

  const { provider } = auth;
  return NextResponse.json({
    profile: {
      id: provider.id,
      name: provider.name,
      city: provider.city,
      district: provider.district ?? "",
      phone: provider.phone,
      email: provider.email,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApprovedProviderApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const city = String(body.city ?? "").trim();
    const district = String(body.district ?? "").trim();
    if (!city) {
      return NextResponse.json({ error: "İl seçin." }, { status: 400 });
    }

    const updated = await updateProvider(auth.providerId, { city, district: district || undefined });
    if (!updated) {
      return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        id: updated.id,
        name: updated.name,
        city: updated.city,
        district: updated.district ?? "",
        phone: updated.phone,
        email: updated.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
  }
}
