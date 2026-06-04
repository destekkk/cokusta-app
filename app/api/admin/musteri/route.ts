import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseAdminPinReset } from "@/lib/admin-pin";
import { setCustomerPin } from "@/lib/customer-pin";
import { createCustomer } from "@/lib/db";
import { adminMutationJson } from "@/lib/admin-api-response";
import { normalizeProviderPhone } from "@/lib/provider-pin";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, city, notes, pin, pinConfirm } = body;

    if (!name || !phone || !city) {
      return NextResponse.json({ error: "Ad, telefon ve şehir zorunlu." }, { status: 400 });
    }

    const pinReset = parseAdminPinReset(pin, pinConfirm);
    if (pinReset.action === "error") {
      return NextResponse.json({ error: pinReset.error }, { status: 400 });
    }
    if (pinReset.action === "skip") {
      return NextResponse.json(
        { error: "Yeni müşteri için 6 haneli giriş şifresi zorunludur." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeProviderPhone(String(phone));
    const customer = await createCustomer({
      name: String(name),
      phone: normalizedPhone,
      email: String(email ?? ""),
      city: String(city),
      notes: notes ? String(notes) : "",
    });

    await setCustomerPin(normalizedPhone, String(pin));

    return adminMutationJson({ success: true, customer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Müşteri eklenemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
