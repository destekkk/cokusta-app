import { NextResponse } from "next/server";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/db";
import { getCustomerSessionPhone } from "@/lib/customer-auth";

export async function GET() {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const profile = await getCustomerProfile(phone);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const city = String(body.city ?? "").trim();
    const district = String(body.district ?? "").trim();
    const result = await updateCustomerProfile(phone, { city, district });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ profile: result.profile });
  } catch {
    return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
  }
}
