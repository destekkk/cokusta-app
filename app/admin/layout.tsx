import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <main>{children}</main>;
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
