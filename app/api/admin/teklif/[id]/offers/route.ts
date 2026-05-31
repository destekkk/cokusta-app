import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getProviderOffersForQuote } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const offers = await getProviderOffersForQuote(id);
  return NextResponse.json({ offers });
}
