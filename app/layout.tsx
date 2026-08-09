import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import WhatsAppChat from "@/components/WhatsAppChat";
import WelcomeGuide from "@/components/WelcomeGuide";
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
  icons: {
    icon: [
      { url: "/icon?v=7", type: "image/png" },
      { url: "/favicon-v3.png?v=7", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon?v=7", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon?v=7"],
  },
  verification: {
    google: "vVMBJfyCZHCxXulXHot9d73US5sTTbrJfT_nZdU4vtw",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    images: [{ url: "/images/og-cokusta.jpg", width: 882, height: 851, alt: SITE_NAME }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Suspense fallback={null}>
          <WelcomeGuide />
          <WhatsAppChat />
        </Suspense>
      </body>
    </html>
  );
}
