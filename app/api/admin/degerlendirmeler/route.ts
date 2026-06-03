import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminOfferReviews } from "@/lib/db";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "pending" || statusParam === "approved" || statusParam === "all"
      ? statusParam
      : "pending";

  const reviews = await listAdminOfferReviews({ status, limit: 150 });
  return NextResponse.json({ reviews });
}
