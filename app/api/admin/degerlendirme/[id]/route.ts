import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminMutationJson } from "@/lib/admin-api-response";
import { approveAdminOfferReview, deleteAdminOfferReview } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.action !== "approve") {
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  }

  const result = await approveAdminOfferReview(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Onaylanamadı." }, { status: 400 });
  }
  return adminMutationJson({ success: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteAdminOfferReview(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Silinemedi." }, { status: 404 });
  }
  return adminMutationJson({ success: true });
}
