import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createCustomer } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, city, notes } = body;

    if (!name || !phone || !city) {
      return NextResponse.json({ error: "Ad, telefon ve şehir zorunlu." }, { status: 400 });
    }

    const customer = await createCustomer({
      name: String(name),
      phone: String(phone),
      email: String(email ?? ""),
      city: String(city),
      notes: notes ? String(notes) : "",
    });

    return NextResponse.json({ success: true, customer });
  } catch {
    return NextResponse.json({ error: "Müşteri eklenemedi." }, { status: 500 });
  }
}
