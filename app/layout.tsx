import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Kurumsal Hizmet Pazaryeri`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Doğrulanmış ustalar, şeffaf teklif süreci ve güvenli ödeme ile profesyonel hizmet alın.",
  robots: { index: true, follow: true },
  verification: {
    google: "vVMBJfyCZHCxXulXHot9d73US5sTTbrJfT_nZdU4vtw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
