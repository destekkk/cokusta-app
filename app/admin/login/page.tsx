import { Suspense } from "react";
import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

// Next.js'in build anında statik olarak üretmesini engeller
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}