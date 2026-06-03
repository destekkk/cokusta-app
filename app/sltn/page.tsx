import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLoginForm from "./login/AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim Girişi | Çokusta",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/sltn/panel");
  }

  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
