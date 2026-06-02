"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type PanelNavItem = {
  href: string;
  label: string;
  /** Varsayılan: pathname eşleşmesi; tab için queryTab kullanın */
  queryTab?: string;
};

type Props = {
  items: PanelNavItem[];
  ariaLabel: string;
  variant?: "light" | "dark";
};

export default function PanelNav({ items, ariaLabel, variant = "light" }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (item: PanelNavItem) => {
    const [path, query] = item.href.split("?");
    if (pathname !== path) return false;
    if (item.queryTab !== undefined) {
      return (searchParams.get("tab") ?? "open") === item.queryTab;
    }
    if (query) {
      const expected = new URLSearchParams(query);
      for (const [key, value] of expected.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
    }
    return true;
  };

  return (
    <nav aria-label={ariaLabel} className="-mx-1 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1 px-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? variant === "dark"
                    ? "bg-white/15 text-white"
                    : "bg-primary text-white shadow-sm"
                  : variant === "dark"
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
