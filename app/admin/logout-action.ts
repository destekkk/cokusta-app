"use server";

import { clearAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
