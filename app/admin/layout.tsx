import Link from "next/link";
import Logo from "@/components/Logo";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/muhasebe", label: "Muhasebe" },
  { href: "/admin/teklifler", label: "Teklifler" },
  { href: "/admin/musteriler", label: "Müşteriler" },
  { href: "/admin/usta-listesi", label: "Ustalar" },
  { href: "/admin/oduller", label: "Ödüller" },
  { href: "/admin/ustalar", label: "Başvurular" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-full bg-background">
      {authed && (
        <header className="border-b border-border bg-secondary text-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Logo variant="dark" size="sm" href="/admin" />
              <span className="ml-2 text-sm font-normal text-white/60">Yönetim</span>
            </div>
              <nav className="hidden gap-4 sm:flex">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-white/75 hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-white/60 hover:text-white">
                Siteye dön
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { clearAdminSession } = await import("@/lib/admin-auth");
                  await clearAdminSession();
                  redirect("/admin/login");
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  Çıkış
                </button>
              </form>
            </div>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
