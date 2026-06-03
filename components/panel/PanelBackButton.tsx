"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  href?: string;
  label?: string;
  className?: string;
};

const baseClass =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary";

export default function PanelBackButton({
  href,
  label = "Geri dön",
  className = "",
}: Props) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className={`${baseClass} ${className}`.trim()}>
        <span aria-hidden>←</span>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${baseClass} ${className}`.trim()}
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
