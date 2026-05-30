import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteCustomer,
  deleteCustomerByKey,
  updateCustomer,
  updateCustomerByKey,
} from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (id.startsWith("quote-")) {
      const key = id.replace("quote-", "");
      const updated = await updateCustomerByKey(key, {
        name: String(body.name),
        phone: String(body.phone),
        email: String(body.email ?? ""),
        city: String(body.city),
        notes: body.notes ? String(body.notes) : "",
      });
      if (!updated) {
        return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const updated = await updateCustomer(id, {
      name: body.name,
      phone: body.phone,
      email: body.email,
      city: body.city,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
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
