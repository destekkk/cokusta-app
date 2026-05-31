import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveDemoQuoteRequests } from "@/lib/db";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const count = await approveDemoQuoteRequests();
    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ error: "Demo teklifler onaylanamadı." }, { status: 500 });
  }
}
