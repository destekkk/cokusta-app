import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { removeProviderPortfolioItem } from "@/lib/db";

type Props = {
  params: Promise<{ id: string; itemId: string }>;
};

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id, itemId } = await params;
  const removed = await removeProviderPortfolioItem(id, itemId);

  if (!removed) {
    return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
