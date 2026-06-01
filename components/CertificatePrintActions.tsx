"use client";

import Link from "next/link";

export default function CertificatePrintActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-amber-800/30 bg-[#faf7f0] px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-amber-50"
      >
        Belgeyi Yazdır
      </button>
      <Link href="/" className="text-sm font-semibold text-primary hover:underline">
        ← Ana sayfaya dön
      </Link>
    </div>
  );
}
