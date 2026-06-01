import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createProviderAdmin } from "@/lib/db";
import {
  PROVIDER_PHONE_EXISTS,
  providerPhoneExistsUserMessage,
} from "@/lib/provider-registration";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      city,
      categorySlugs,
      experience,
      bio,
      status,
    } = body;

    if (!name || !phone || !city || !categorySlugs?.length) {
      return NextResponse.json(
        { error: "Ad, telefon, şehir ve en az bir kategori zorunlu." },
        { status: 400 }
      );
    }

    const provider = await createProviderAdmin({
      name: String(name),
      phone: String(phone),
      email: String(email ?? ""),
      city: String(city),
      categorySlugs,
      experience: String(experience ?? ""),
      bio: String(bio ?? ""),
      status: status ?? "approved",
      platformPurchases: [],
    });

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    if (error instanceof Error && error.message === PROVIDER_PHONE_EXISTS) {
      const status = (error as Error & { providerStatus?: string }).providerStatus as
        | "pending"
        | "approved"
        | "rejected"
        | undefined;
      return NextResponse.json(
        { error: providerPhoneExistsUserMessage(status) },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Usta eklenemedi." }, { status: 500 });
  }
}
