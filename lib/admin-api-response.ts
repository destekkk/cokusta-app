import { NextResponse } from "next/server";
import { revalidateAdminPages } from "@/lib/admin-revalidate";

export function adminMutationJson<T extends object>(body: T, init?: ResponseInit) {
  revalidateAdminPages();
  return NextResponse.json(body, init);
}
