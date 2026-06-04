import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteProvider,
  getProviderById,
  setProviderPin,
  updateProvider,
  updateProviderStatus,
} from "@/lib/db";
import { adminMutationJson } from "@/lib/admin-api-response";
import { parseAdminPinReset } from "@/lib/admin-pin";

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
      return adminMutationJson({ success: true, provider: updated });
    }

    const pinReset = parseAdminPinReset(body.pin, body.pinConfirm);
    if (pinReset.action === "error") {
      return NextResponse.json({ error: pinReset.error }, { status: 400 });
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

    if (pinReset.action === "set") {
      const pinSaved = await setProviderPin(id, pinReset.pinHash);
      if (!pinSaved) {
        return NextResponse.json({ error: "Şifre kaydedilemedi." }, { status: 500 });
      }
    }

    return adminMutationJson({ success: true, provider: updated });
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
    const provider = await getProviderById(id);
    if (!provider) {
      return NextResponse.json({ error: "Usta bulunamadı." }, { status: 404 });
    }
    if (provider.status !== "rejected") {
      return NextResponse.json(
        { error: "Sadece reddedilmiş başvurular silinebilir. Önce reddedin." },
        { status: 400 }
      );
    }
    const deleted = await deleteProvider(id);
    if (!deleted) {
      return NextResponse.json({ error: "Silinemedi." }, { status: 404 });
    }
    return adminMutationJson({ success: true });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
