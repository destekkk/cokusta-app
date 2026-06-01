"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Bir hata oluştu</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Sayfa yüklenemedi. Birkaç dakika sonra tekrar deneyin veya ana sayfaya dönün.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
