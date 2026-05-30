import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteProvider, updateProvider, updateProviderStatus } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status === "approved" || body.status === "rejected") {
      const updated = await updateProviderStatus(id, body.status, body.rejectionReason);
      if (!updated) {
        return NextResponse.json({ error: "Usta bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ success: true, provider: updated });
    }

    const updated = await updateProvider(id, {
      name: body.name,
      phone: body.phone,
      email: body.email,
      city: body.city,
      categorySlugs: body.categorySlugs,
      experience: body.experience,
      bio: body.bio,
      status: body.status,
    });

    if (!updated) {
      return NextResponse.json({ error: "Usta bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, provider: updated });
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
    const deleted = await deleteProvider(id);
    if (!deleted) {
      return NextResponse.json({ error: "Usta bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
