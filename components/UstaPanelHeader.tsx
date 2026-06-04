"use client";

import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export default function UstaPanelHeader({
  title = "Usta Paneli",
  subtitle = "Açık taleplere teklif verin, pazarlık yapın ve kazancınızı yönetin.",
  backHref,
  backLabel = "← Tekliflere dön",
}: Props) {
  return (
    <div className="space-y-0">
      <div className="-mx-4 border-b border-white/10 bg-secondary px-4 py-3 text-white sm:-mx-6 sm:px-6">
        {backHref ? (
          <Link href={backHref} className="text-sm font-medium text-white/90 hover:text-white hover:underline">
            {backLabel}
          </Link>
        ) : (
          <span className="text-sm font-bold tracking-tight">Usta Paneli</span>
        )}
      </div>

      <div className="space-y-4 border-b border-border pb-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
