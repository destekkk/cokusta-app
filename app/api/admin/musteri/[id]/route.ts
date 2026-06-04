import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseAdminPinReset } from "@/lib/admin-pin";
import { setCustomerPin } from "@/lib/customer-pin";
import {
  deleteCustomer,
  deleteCustomerByKey,
  updateCustomer,
  updateCustomerByKey,
} from "@/lib/db";
import { normalizeProviderPhone } from "@/lib/provider-pin";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const pinReset = parseAdminPinReset(body.pin, body.pinConfirm);
    if (pinReset.action === "error") {
      return NextResponse.json({ error: pinReset.error }, { status: 400 });
    }

    const phone = normalizeProviderPhone(String(body.phone ?? ""));

    if (id.startsWith("quote-")) {
      const key = id.replace("quote-", "");
      const updated = await updateCustomerByKey(key, {
        name: String(body.name),
        phone,
        email: String(body.email ?? ""),
        city: String(body.city),
        notes: body.notes ? String(body.notes) : "",
      });
      if (!updated) {
        return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
      }
      if (pinReset.action === "set") {
        await setCustomerPin(phone, String(body.pin));
      }
      return NextResponse.json({ success: true });
    }

    const updated = await updateCustomer(id, {
      name: body.name,
      phone,
      email: body.email,
      city: body.city,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    if (pinReset.action === "set") {
      await setCustomerPin(phone, String(body.pin));
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Güncelleme başarısız.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (id.startsWith("quote-")) {
      const key = id.replace("quote-", "");
      const deleted = await deleteCustomerByKey(key);
      if (!deleted) {
        return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
